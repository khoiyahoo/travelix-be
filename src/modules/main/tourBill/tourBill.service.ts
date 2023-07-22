import { Inject, Service } from "typedi";
import { Cancel, CheckoutPayload, Create, FindAll, ReSchedule, Update } from "./tourBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import moment from "moment";
import { EBillStatus, EPaymentStatus } from "models/general";
import querystring from "qs";
import crypto from "crypto";
import { Op } from "sequelize";
import { EServiceType } from "common/general";

@Service()
export default class TourBillService {
  constructor(
    @Inject("tourBillsModel") private tourBillsModel: ModelsInstance.TourBills,
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales,
    @Inject("vnPaysModel") private vnPaysModel: ModelsInstance.VNPays,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions
  ) {}
  public async getCommissionRate(price: number) {
    const commissions = await this.commissionsModel.findAll({
      where: {
        serviceType: EServiceType.TOUR,
      },
    });
    let rate = 0;
    commissions.forEach((item) => {
      if (!item.maxPrice && price >= item.minPrice) {
        rate = item.rate;
      } else if (price >= item.minPrice && price < item.maxPrice) {
        rate = item.rate;
      }
    });
    return rate;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async sortObject(obj: any) {
    // eslint-disable-next-line prefer-const
    let sorted: any = {};
    const str = [];
    let key;
    for (key in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }
  private async buildCheckoutUrl(userPaymentId: number, payload: CheckoutPayload) {
    // await this.vnPaysModel.create({
    //   vpc_MerchTxnRef: payload.transactionId,
    //   userPaymentId: userPaymentId,
    //   amount: payload.amount,
    //   status: EVNPayStatus.CREATE,
    //   module: module,
    //   rawCheckout: payload,
    //   vpc_OrderInfo: payload.orderId,
    //   vpc_TicketNo: payload.clientIp,
    // })

    const createDate = moment().format("YYYYMMDDHHmmss");
    const locale = "vn";
    const currCode = "VND";
    let vnp_Params: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: process.env.vnp_TmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: payload.orderId,
      vnp_OrderInfo: "Thanh toan cho ma GD:" + payload.orderId,
      vnp_OrderType: "other",
      vnp_Amount: payload.amount * 100,
      vnp_ReturnUrl: process.env.vnp_ReturnUrl,
      vnp_IpAddr: payload.clientIp,
      vnp_CreateDate: createDate,
    };

    vnp_Params = await this.sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", process.env.vnp_HashSecret);
    const signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    let vnpUrl = process.env.vnp_Url;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl;
  }
  public async create(data: Create, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tour = await this.toursModel.findOne({
        where: {
          id: data.tourId,
          parentLanguage: null,
          isDeleted: false,
        },
        include: [
          {
            association: "languages",
          },
          {
            association: "tourPolicies",
            where: {
              serviceType: EServiceType.TOUR,
            },
            order: [["dayRange", "ASC"]],
          },
          {
            attributes: ["id", "day", "startTime", "endTime", "description", "parentLanguage", "language"],
            association: "tourSchedules",
            where: {
              language: null,
            },
            include: [
              {
                attributes: ["id", "day", "startTime", "endTime", "description", "parentLanguage", "language"],
                association: "languages",
                order: [["startTime", "ASC"]],
              }
            ],
            order: [["startTime", "ASC"]],
          },
        ],
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      const tourOnSale = await this.tourOnSalesModel.findOne({
        where: {
          id: data.tourOnSaleId,
          isDeleted: false,
        },
      });
      if (!tourOnSale) {
        return res.onError({
          status: 404,
          detail: "Tour on sale not found",
        });
      }
      if (tourOnSale.quantityOrdered + data.amountAdult + data.amountChild > tourOnSale.quantity) {
        return res.onError({
          status: 400,
          detail: "Not enough quantity",
        });
      }
      tourOnSale.quantityOrdered = tourOnSale.quantityOrdered + data.amountAdult + data.amountChild;
      await tourOnSale.save({ transaction: t });

      const commissionRate = await this.getCommissionRate(data.totalBill);
      const newTourBill = await this.tourBillsModel.create(
        {
          userId: user?.id,
          tourId: data?.tourId,
          tourOwnerId: tour.owner,
          tourOnSaleId: data?.tourOnSaleId,
          amountChild: data?.amountChild,
          amountAdult: data?.amountAdult,
          price: data?.price,
          discount: data?.discount,
          totalBill: data?.totalBill,
          commissionRate: commissionRate,
          commission: data?.totalBill * commissionRate,
          email: data?.email,
          phoneNumber: data?.phoneNumber,
          firstName: data?.firstName,
          lastName: data?.lastName,
          paymentStatus: EPaymentStatus.NOT_PAID,
          status: EBillStatus.NOT_CONTACTED_YET,
          tourData: tour,
          tourOnSaleData: tourOnSale,
          expiredTime: moment().add(process.env.MAXAGE_TOKEN_BOOK_SERVICE, "minutes"),
        },
        {
          transaction: t,
        }
      );
      const payload = {
        amount: data?.totalBill,
        orderId: `${newTourBill.id}`,
        clientIp: `${user.id}`,
      };
      const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);
      await t.commit();
      return res.onSuccess(
        { newTourBill, checkoutUrl },
        {
          message: res.locals.t("tour_bill_create_success"),
        }
      );
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async againLink(billId: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourBill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!tourBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      let payload = {
        amount: tourBill.totalBill,
        orderId: `${tourBill.id}`,
        clientIp: `${user.id}`,
      };
      if (tourBill.oldBillId) {
        payload = {
          ...payload,
          amount: tourBill.extraPay,
        };
      }
      const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);
      await t.commit();
      return res.onSuccess(
        { tourBill, checkoutUrl },
        {
          message: res.locals.t("get_again_link_success"),
        }
      );
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(billId: number, data: Update, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourBill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!tourBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      if (data?.paymentStatus) {
        tourBill.paymentStatus = data.paymentStatus;
        if (data.paymentStatus === EPaymentStatus.PAID && tourBill.oldBillId) {
          const oldBill = await this.tourBillsModel.findOne({
            where: {
              id: tourBill.oldBillId,
            },
          });
          if (!oldBill) {
            return res.onError({
              status: 404,
              detail: "Old bill not found",
            });
          }
          const tourOnSale = await this.tourOnSalesModel.findOne({
            where: {
              id: oldBill.tourOnSaleId,
              isDeleted: false,
            },
          });
          if (!tourOnSale) {
            return res.onError({
              status: 404,
              detail: "Tour on sale not found",
            });
          }
          tourOnSale.quantityOrdered = tourOnSale.quantityOrdered - oldBill.amountAdult - oldBill.amountChild;
          await tourOnSale.save({ transaction: t });
        }
      }
      if (data?.participantsInfo) tourBill.participantsInfo = data.participantsInfo;

      await tourBill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tourBill, {
        message: res.locals.t("tour_bill_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const offset = data.take * (data.page - 1);
      const bills = await this.tourBillsModel.findAndCountAll({
        where: {
          userId: user.id,
          status: { [Op.not]: EBillStatus.RESCHEDULED },
        },
        include: [
          {
            association: "oldBillData",
          },
          {
            association: "tourInfo",
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
        order: [["createdAt", "DESC"]],
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      return res.onSuccess(bills.rows, {
        meta: {
          take: data.take,
          itemCount: bills.count,
          page: data.page,
          pageCount: Math.ceil(bills.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(billId: number, res: Response) {
    try {
      const bill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
        },
        include: [
          {
            association: "tourInfo",
          },
        ],
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: "bill_not_found",
        });
      }
      return res.onSuccess(bill, {
        message: res.locals.t("get_tour_bill_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findLatest(tourId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const bill = await this.tourBillsModel.findAll({
        where: {
          userId: user.id,
          tourId: tourId,
          status: EBillStatus.USED,
        },
        order: [["createdAt", "DESC"]],
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: "bill_not_found",
        });
      }
      const result = bill.length > 0 ? bill[0] : null;
      return res.onSuccess(result, {
        message: res.locals.t("get_tour_bill_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async reSchedule(billId: number, data: ReSchedule, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tour = await this.toursModel.findOne({
        where: {
          id: data.tourId,
          parentLanguage: null,
          isDeleted: false,
        },
        include: [
          {
            association: "languages",
          },
          {
            association: "tourPolicies",
            where: {
              serviceType: EServiceType.TOUR,
            },
            order: [["dayRange", "ASC"]],
          },
          {
            attributes: ["id", "day", "startTime", "endTime", "description", "parentLanguage", "language"],
            association: "tourSchedules",
            where: {
              language: null,
            },
            include: [
              {
                attributes: ["id", "day", "startTime", "endTime", "description", "parentLanguage", "language"],
                association: "languages",
                order: [["startTime", "ASC"]],
              }
            ],
            order: [["startTime", "ASC"]],
          },
        ],
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      // handle old bill
      const tourBill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!tourBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      tourBill.status = EBillStatus.RESCHEDULED;
      await tourBill.save({ transaction: t });

      // handle minus ticket of tour on sale
      const tourOnSale = await this.tourOnSalesModel.findOne({
        where: {
          id: data.tourOnSaleId,
          isDeleted: false,
        },
      });
      if (!tourOnSale) {
        return res.onError({
          status: 404,
          detail: "Tour on sale not found",
        });
      }
      if (tourOnSale.quantityOrdered + data.amountAdult + data.amountChild > tourOnSale.quantity) {
        return res.onError({
          status: 400,
          detail: "Not enough quantity",
        });
      }
      tourOnSale.quantityOrdered = tourOnSale.quantityOrdered + data.amountAdult + data.amountChild;
      await tourOnSale.save({ transaction: t });

      // handle re-schedule
      const commissionRate = await this.getCommissionRate(data.totalBill);
      const newTourBill = await this.tourBillsModel.create(
        {
          userId: user?.id,
          tourId: data?.tourId,
          tourOwnerId: tour.owner,
          tourOnSaleId: data?.tourOnSaleId,
          amountChild: data?.amountChild,
          amountAdult: data?.amountAdult,
          price: data?.price,
          discount: data?.discount,
          totalBill: data?.totalBill,
          commissionRate: commissionRate,
          commission: data?.totalBill * commissionRate,
          email: data?.email,
          phoneNumber: data?.phoneNumber,
          firstName: data?.firstName,
          lastName: data?.lastName,
          extraPay: data?.extraPay || null,
          moneyRefund: data?.moneyRefund || null,
          paymentStatus: data?.extraPay > 0 ? EPaymentStatus.NOT_PAID : EPaymentStatus.PAID,
          status: EBillStatus.NOT_CONTACTED_YET,
          tourData: tourBill.tourData,
          participantsInfo: tourBill.participantsInfo,
          tourOnSaleData: tourOnSale,
          expiredTime: moment().add(process.env.MAXAGE_TOKEN_BOOK_SERVICE, "minutes"),
          oldBillId: tourBill.id,
        },
        {
          transaction: t,
        }
      );

      if (data?.extraPay > 0) {
        const payload = {
          amount: data.extraPay,
          orderId: `${newTourBill.id}`,
          clientIp: `${user.id}`,
        };
        const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);
        await t.commit();
        return res.onSuccess(
          { tourBill: newTourBill, checkoutUrl: checkoutUrl },
          {
            message: res.locals.t("tour_bill_update_success"),
          }
        );
      }
      await t.commit();
      return res.onSuccess(newTourBill, {
        message: res.locals.t("tour_bill_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  // Cancel the booked ticket
  public async cancel(billId: number, data: Cancel, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourBill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!tourBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      tourBill.status = EBillStatus.CANCELED;
      tourBill.moneyRefund = data.moneyRefund;
      await tourBill.save({ transaction: t });

      // handle minus ticket of tour on sale
      const tourOnSale = await this.tourOnSalesModel.findOne({
        where: {
          id: tourBill.tourOnSaleId,
          isDeleted: false,
        },
      });
      if (!tourOnSale) {
        return res.onError({
          status: 404,
          detail: "Tour on sale not found",
        });
      }
      tourOnSale.quantityOrdered = tourOnSale.quantityOrdered + tourBill.amountAdult + tourBill.amountChild;
      await tourOnSale.save({ transaction: t });

      await t.commit();
      return res.onSuccess(tourBill, {
        message: res.locals.t("cancel_tour_bill_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  // /**
  //  * Get a tour bill
  //  */
  // public async findOne(billId: number, res: Response) {
  //   try {
  //     const bill = await this.tourBillsModel.findOne({
  //       where: {
  //         id: billId,
  //       },
  //     });
  //     if (!bill) {
  //       return res.onError({
  //         status: 404,
  //         detail: "bill_not_found",
  //       });
  //     }
  //     return res.onSuccess(bill, {
  //       message: res.locals.t("get_tour_bill_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all tour bills of any tour
  //  */
  // // public async getAllTourBills(tourId: number, res: Response) {
  // //   try {
  // //     const bills = await this.tourBillsModel.findAll({
  // //       where: {
  // //         tourId: tourId,
  // //       },
  // //       include: {
  // //         association: "userInfo",
  // //       },
  // //     });
  // //     if (!bills) {
  // //       return res.onError({
  // //         status: 404,
  // //         detail: "not_found",
  // //       });
  // //     }
  // //     const allBills: any[] = [];
  // //     bills.map((item) => {
  // //       if (!item?.verifyCode || new Date().getTime() < new Date(item?.expiredDate).getTime()) {
  // //         allBills.push({
  // //           ...item?.dataValues,
  // //         });
  // //       }
  // //     });
  // //     return res.onSuccess(allBills, {
  // //       message: res.locals.t("get_all_tour_bills_success"),
  // //     });
  // //   } catch (error) {
  // //     return res.onError({
  // //       status: 500,
  // //       detail: error,
  // //     });
  // //   }
  // // }

  // /**
  //  * Get all tour bills of any user
  //  */
  // public async findAll(data: FindAll ,user: ModelsAttributes.User, res: Response) {
  //   try {
  //     const offset = data.take * (data.page - 1);
  //     const bills = await this.tourBillsModel.findAndCountAll({
  //       where: {
  //         userId: user.id,
  //       },
  //       limit: data.take,
  //       offset: offset,
  //       distinct: true,
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const allBills: any[] = [];
  //     bills.rows.map((item) => {
  //       if (new Date().getTime() < new Date(item?.expiredDate).getTime()) {
  //         allBills.push({
  //           ...item?.dataValues,
  //         });
  //       }
  //     });
  //     return res.onSuccess(allBills, {
  //       message: res.locals.t("get_all_tour_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all tour bills of any date
  //  */
  // public async getAllTourBillsAnyDate(data: IGetAllTourBillsAnyDate, res: Response) {
  //   try {
  //     const listTourBills = await this.tourBillsModel.findAll({
  //       where: {
  //         tourId: {
  //           [Op.or]: data.tourIds,
  //         },
  //       },
  //       include: {
  //         association: "tourInfo",
  //       },
  //     });
  //     if (!listTourBills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }
  //     const allBills: any[] = [];
  //     const dateRequest = new Date(data.date);
  //     const date = dateRequest.getDate();
  //     const month = dateRequest.getMonth();
  //     const year = dateRequest.getFullYear();
  //     listTourBills.map((item) => {
  //       const dateCreated = new Date(item?.createdAt);
  //       const createDate = dateCreated.getDate();
  //       const createMonth = dateCreated.getMonth();
  //       const createYear = dateCreated.getFullYear();
  //       if (date === createDate && month === createMonth && year === createYear) {
  //         allBills.push({
  //           ...item?.dataValues,
  //         });
  //       }
  //     });
  //     return res.onSuccess(allBills, {
  //       message: res.locals.t("get_all_tour_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async createTourBill(data: ICreateTourBill, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     // tour
  //     const tour = await this.toursModel.findOne({
  //       where: {
  //         id: data?.tourId,
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!tour) {
  //       return res.onError({
  //         status: 404,
  //         detail: "tour_not_found",
  //       });
  //     }

  //     // tour bill
  //     const discount = data?.discount || 0;
  //     const totalBill = (data.amount * data.price * (100 - discount)) / 100;
  //     // const codeVerify = uuidv4();

  //     const newTourBill = await this.tourBillsModel.create(
  //       {
  //         userId: data?.userId,
  //         tourId: data?.tourId,
  //         amount: data?.amount,
  //         price: data?.price,
  //         discount: data?.discount,
  //         totalBill: totalBill,
  //         email: data?.email,
  //         phoneNumber: data?.phoneNumber,
  //         firstName: data?.firstName,
  //         lastName: data?.lastName,
  //         bankName: data?.bankName,
  //         bankAccountName: data?.bankAccountName,
  //         bankNumber: data?.bankNumber,
  //         accountExpirationDate: data?.accountExpirationDate,
  //         deposit: data?.deposit,
  //         verifyCode: null,
  //         expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate(),
  //       },
  //       {
  //         transaction: t,
  //       }
  //     );

  //     await t.commit();
  //     return res.onSuccess(newTourBill, {
  //       message: res.locals.t("tour_bill_create_success"),
  //     });
  //     //email
  //     // const emailRes = await EmailService.sendConfirmBookTour(
  //     //   data?.userMail,
  //     //   `${process.env.SITE_URL}/book/verifyBookTour?code=${newTourBill.verifyCode}&billId=${newTourBill.id}`
  //     // );
  //     // if (emailRes.isSuccess) {
  //     //   await t.commit();
  //     //   return res.onSuccess(newTourBill, {
  //     //     message: res.locals.t("tour_bill_create_success"),
  //     //   });
  //     // } else {
  //     //   await t.rollback();
  //     //   return res.onError({
  //     //     status: 500,
  //     //     detail: "email_sending_failed",
  //     //   });
  //     // }
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async verifyBookTour(data: IVerifyBookTour, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     // verify code
  //     const bill = await this.tourBillsModel.findOne({
  //       where: {
  //         id: data.billId,
  //       },
  //     });
  //     if (!bill) {
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("tour_bill_not_found"),
  //       });
  //     }
  //     if (!bill.verifyCode) {
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("tour_bill_was_verified"),
  //       });
  //     }

  //     if (new Date() < new Date(bill?.expiredDate)) {
  //       bill.verifyCode = null;
  //       await bill.save({ transaction: t });
  //       await t.commit();

  //       return res.onSuccess({
  //         detail: res.locals.t("complete_verification"),
  //       });
  //     } else {
  //       await t.rollback();
  //       return res.onError({
  //         status: 400,
  //         detail: res.locals.t("the_verification_code_has_expired"),
  //       });
  //     }
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Cancel tour bill
  //  */
  // public async cancelTourBill(billId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     await this.tourBillsModel.destroy({
  //       where: {
  //         id: billId,
  //       },
  //     });
  //     await t.commit();
  //     return res.onSuccess("Cancel successfully", {
  //       message: res.locals.t("Cancel successfully"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all tours revenue by month
  //  */
  // public async getRevenueOfToursByMonth(data: IGetToursRevenueByMonth, res: Response) {
  //   try {
  //     const bills = await this.tourBillsModel.findAll({
  //       where: {
  //         tourId: {
  //           [Op.or]: data.tourIds,
  //         },
  //         verifyCode: null,
  //       },
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const tourBillArr: TourBillAttributes[][] = [];
  //     data.tourIds.forEach((tourId) => {
  //       tourBillArr.push(
  //         bills.filter(
  //           (bill) =>
  //             bill?.dataValues?.tourId === tourId &&
  //             new Date(bill?.dataValues?.createdAt).getMonth() === data.month &&
  //             new Date(bill?.dataValues?.createdAt).getFullYear() === data.year
  //         )
  //       );
  //     });
  //     const tourBillDetailArr: any[][] = [];
  //     tourBillArr.forEach((tourBills) => {
  //       const tourBillDetail: any[] = [];
  //       tourBills.forEach((billItem) => {
  //         const date = new Date(billItem?.dataValues?.createdAt).getDate();
  //         let isNotHaveDate = true;
  //         tourBillDetail.forEach((detailItem) => {
  //           if (detailItem?.date === date) {
  //             isNotHaveDate = false;
  //             detailItem!.cost += billItem?.dataValues?.totalBill;
  //           }
  //         });
  //         if (isNotHaveDate) {
  //           tourBillDetail.push({
  //             date: date,
  //             cost: billItem?.dataValues?.totalBill,
  //           });
  //         }
  //       });
  //       tourBillDetailArr.push(tourBillDetail);
  //     });
  //     return res.onSuccess(tourBillDetailArr, {
  //       message: res.locals.t("get_all_tour_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // /**
  //  * Get all tours revenue by year
  //  */
  // public async getRevenueOfToursByYear(data: IGetToursRevenueByYear, res: Response) {
  //   try {
  //     const bills = await this.tourBillsModel.findAll({
  //       where: {
  //         tourId: {
  //           [Op.or]: data.tourIds,
  //         },
  //         verifyCode: null,
  //       },
  //     });
  //     if (!bills) {
  //       return res.onError({
  //         status: 404,
  //         detail: "not_found",
  //       });
  //     }
  //     const tourBillArr: TourBillAttributes[][] = [];
  //     data.tourIds.forEach((tourId) => {
  //       tourBillArr.push(
  //         bills.filter((bill) => bill?.dataValues?.tourId === tourId && new Date(bill?.dataValues?.createdAt).getFullYear() === data.year)
  //       );
  //     });
  //     const tourBillDetailArr: any[][] = [];
  //     tourBillArr.forEach((tourBills) => {
  //       const tourBillDetail: any[] = [];
  //       tourBills.forEach((billItem) => {
  //         const month = new Date(billItem?.dataValues?.createdAt).getMonth();
  //         let isNotHaveMonth = true;
  //         tourBillDetail.forEach((detailItem) => {
  //           if (detailItem?.month === month) {
  //             isNotHaveMonth = false;
  //             detailItem!.cost += billItem?.dataValues?.totalBill;
  //           }
  //         });
  //         if (isNotHaveMonth) {
  //           tourBillDetail.push({
  //             month: month,
  //             cost: billItem?.dataValues?.totalBill,
  //           });
  //         }
  //       });
  //       tourBillDetailArr.push(tourBillDetail);
  //     });
  //     return res.onSuccess(tourBillDetailArr, {
  //       message: res.locals.t("get_all_tour_bills_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }
}
