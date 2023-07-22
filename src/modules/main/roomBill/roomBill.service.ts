/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { Cancel, Create, FindAll, ReSchedule, Update } from "./roomBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import moment from "moment";
import { Op } from "sequelize";
import { EServiceType } from "common/general";
import { EBillStatus, EPaymentStatus } from "models/general";
import { CheckoutPayload } from "../tourBill/tourBill.models";
import querystring from "qs";
import crypto from "crypto";

@Service()
export default class RoomBillService {
  constructor(
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.RoomBills,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomOtherPricesModel")
    @Inject("roomBillDetailsModel")
    private roomBillDetailsModel: ModelsInstance.RoomBillDetails,
    @Inject("checkRoomsModel") private checkRoomsModel: ModelsInstance.CheckRooms,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions
  ) {}
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
      vnp_ReturnUrl: process.env.vnp_StayReturnUrl,
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
  public async getCommissionRate(price: number) {
    const commissions = await this.commissionsModel.findAll({
      where: {
        serviceType: EServiceType.HOTEL,
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

  public async create(data: Create, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const stayData = await this.staysModel.findOne({
        where: {
          id: data.stayId,
        },
        include: [
          {
            association: "languages",
          },
          {
            association: "stayPolicies",
            where: {
              serviceType: EServiceType.HOTEL,
            },
          },
        ],
      });
      const commissionRate = await this.getCommissionRate(data.totalBill);
      const commission = data.totalBill * commissionRate;
      const newRoomBill = await this.roomBillsModel.create(
        {
          userId: user.id,
          stayId: data.stayId,
          stayOwnerId: stayData.owner,
          startDate: data.startDate,
          endDate: data.endDate,
          price: data.price,
          discount: data.discount,
          totalBill: data.totalBill,
          commissionRate: commissionRate,
          commission: commission,
          email: data.email,
          phoneNumber: data.phoneNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          paymentStatus: EPaymentStatus.NOT_PAID,
          status: EBillStatus.NOT_CONTACTED_YET,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_BOOK_SERVICE, "minutes").toDate(),
          stayData: stayData,
        },
        {
          transaction: t,
        }
      );

      const roomIds: number[] = [];
      data?.rooms.forEach((item) => {
        if (!roomIds.includes(item.roomId)) roomIds.push(item.roomId);
      });
      const checkRooms = await this.checkRoomsModel.findAll({
        where: {
          roomId: roomIds,
          bookedDate: {
            [Op.and]: {
              [Op.gte]: data.startDate,
              [Op.lt]: data.endDate,
            },
          },
        },
      });

      const rooms = await this.roomsModel.findAll({
        // attributes: ["id", "numberOfRoom"],
        where: {
          id: roomIds,
        },
      });

      const updateCheckRooms: any[] = [];
      const createCheckRooms: any[] = [];
      const roomBillDetails = data?.rooms.map((room) => {
        const checkRoom = checkRooms.find(
          (item) =>
            item.roomId === room.roomId && moment(item.bookedDate).format("DD/MM/YYYY") === moment(room.bookedDate).format("DD/MM/YYYY")
        );
        if (checkRoom) {
          updateCheckRooms.push({
            ...checkRoom.dataValues,
            numberOfRoomsAvailable: checkRoom.numberOfRoomsAvailable - room.amount,
          });
        } else {
          createCheckRooms.push({
            bookedDate: room.bookedDate,
            numberOfRoomsAvailable: rooms.find((item) => item.id === room.roomId)?.numberOfRoom - room.amount,
            stayId: data.stayId,
            roomId: room.roomId,
          });
        }

        const commissionRoom = commission * ((room.amount * room.price * (100 - room.discount)) / 100 / data.price);
        return {
          billId: newRoomBill.id,
          roomId: room.roomId,
          stayId: data.stayId,
          stayOwnerId: stayData.owner,
          amount: room.amount,
          price: room.price,
          bookedDate: room.bookedDate,
          commission: commissionRoom,
          paymentStatus: EPaymentStatus.NOT_PAID,
          status: EBillStatus.NOT_CONTACTED_YET,
          roomData: rooms.find((item) => item.id === room.roomId),
        };
      });

      await Promise.all(
        updateCheckRooms.map(
          async (item) =>
            await this.checkRoomsModel.update(
              {
                numberOfRoomsAvailable: item.numberOfRoomsAvailable,
              },
              {
                where: {
                  id: item.id,
                },
                transaction: t,
              }
            )
        )
      );

      await this.checkRoomsModel.bulkCreate(createCheckRooms, {
        transaction: t,
      });

      await this.roomBillDetailsModel.bulkCreate(roomBillDetails, {
        transaction: t,
      });

      const payload = {
        amount: data?.totalBill,
        orderId: `stay-${newRoomBill.id}`,
        clientIp: `${user.id}`,
      };
      const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);

      await t.commit();
      return res.onSuccess(
        { bill: newRoomBill, checkoutUrl },
        {
          message: res.locals.t("room_bill_create_success"),
        }
      );
      //email
      // const emailRes = await EmailService.sendConfirmBookRoom(
      //   data?.userMail,
      //   `${process.env.SITE_URL}/book/verifyBookRoom?code=${newRoomBill.verifyCode}&billId=${newRoomBill.id}`
      // );
      // if (emailRes.isSuccess) {
      //   await t.commit();
      //   return res.onSuccess(newRoomBill, {
      //     message: res.locals.t("room_bill_create_success"),
      //   });
      // } else {
      //   await t.rollback();
      //   return res.onError({
      //     status: 500,
      //     detail: "email_sending_failed",
      //   });
      // }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async reSchedule(billId: number, data: ReSchedule, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const stayData = await this.staysModel.findOne({
        where: {
          id: data.stayId,
        },
        include: [
          {
            association: "languages",
          },
          {
            association: "stayPolicies",
            where: {
              serviceType: EServiceType.HOTEL,
            },
          },
        ],
      });
      const commissionRate = await this.getCommissionRate(data.totalBill);
      const commission = data.totalBill * commissionRate;
      const newRoomBill = await this.roomBillsModel.create(
        {
          userId: user.id,
          stayId: data.stayId,
          stayOwnerId: stayData.owner,
          startDate: data.startDate,
          endDate: data.endDate,
          price: data.price,
          discount: data.discount,
          totalBill: data.totalBill,
          extraPay: data?.extraPay || null,
          moneyRefund: data?.moneyRefund || null,
          commissionRate: commissionRate,
          commission: commission,
          email: data.email,
          phoneNumber: data.phoneNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          paymentStatus: data?.extraPay > 0 ? EPaymentStatus.NOT_PAID : EPaymentStatus.PAID,
          status: EBillStatus.NOT_CONTACTED_YET,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_BOOK_SERVICE, "minutes").toDate(),
          stayData: stayData,
          oldBillId: billId,
        },
        {
          transaction: t,
        }
      );
      // handle old bill
      const oldRoomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!oldRoomBill) {
        return res.onError({
          status: 404,
          detail: "Room bill not found",
        });
      }

      const roomIds: number[] = [];
      data?.rooms.forEach((item) => {
        if (!roomIds.includes(item.roomId)) roomIds.push(item.roomId);
      });
      const checkRooms = await this.checkRoomsModel.findAll({
        where: {
          roomId: roomIds,
          bookedDate: {
            [Op.and]: {
              [Op.gte]: data.startDate,
              [Op.lt]: data.endDate,
            },
          },
        },
      });

      const rooms = await this.roomsModel.findAll({
        // attributes: ["id", "numberOfRoom"],
        where: {
          id: roomIds,
        },
      });

      const updateCheckRooms: any[] = [];
      const createCheckRooms: any[] = [];
      const roomBillDetails = data?.rooms.map((room) => {
        const checkRoom = checkRooms.find(
          (item) =>
            item.roomId === room.roomId && moment(item.bookedDate).format("DD/MM/YYYY") === moment(room.bookedDate).format("DD/MM/YYYY")
        );
        if (checkRoom) {
          updateCheckRooms.push({
            ...checkRoom.dataValues,
            numberOfRoomsAvailable: checkRoom.numberOfRoomsAvailable - room.amount,
          });
        } else {
          createCheckRooms.push({
            bookedDate: room.bookedDate,
            numberOfRoomsAvailable: rooms.find((item) => item.id === room.roomId)?.numberOfRoom - room.amount,
            stayId: data.stayId,
            roomId: room.roomId,
          });
        }

        const commissionRoom = commission * ((room.amount * room.price * (100 - room.discount)) / 100 / data.price);
        return {
          billId: newRoomBill.id,
          roomId: room.roomId,
          stayId: data.stayId,
          stayOwnerId: stayData.owner,
          amount: room.amount,
          price: room.price,
          bookedDate: room.bookedDate,
          commission: commissionRoom,
          paymentStatus: data?.extraPay > 0 ? EPaymentStatus.NOT_PAID : EPaymentStatus.PAID,
          roomData: rooms.find((item) => item.id === room.roomId),
        };
      });

      await Promise.all(
        updateCheckRooms.map(
          async (item) =>
            await this.checkRoomsModel.update(
              {
                numberOfRoomsAvailable: item.numberOfRoomsAvailable,
              },
              {
                where: {
                  id: item.id,
                },
                transaction: t,
              }
            )
        )
      );

      await this.checkRoomsModel.bulkCreate(createCheckRooms, {
        transaction: t,
      });

      await this.roomBillDetailsModel.bulkCreate(roomBillDetails, {
        transaction: t,
      });

      if (data?.extraPay > 0) {
        const payload = {
          amount: data.extraPay,
          orderId: `stay-${newRoomBill.id}`,
          clientIp: `${user.id}`,
        };
        const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);
        await t.commit();
        return res.onSuccess(
          { tourBill: newRoomBill, checkoutUrl: checkoutUrl },
          {
            message: res.locals.t("common_success"),
          }
        );
      }
      await oldRoomBill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(newRoomBill, {
        message: res.locals.t("common_success"),
      });
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
      const roomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!roomBill) {
        return res.onError({
          status: 404,
          detail: "Room bill not found",
        });
      }

      let payload = {
        amount: roomBill.totalBill,
        orderId: `stay-${roomBill.id}`,
        clientIp: `${user.id}`,
      };
      if (roomBill.oldBillId) {
        payload = {
          ...payload,
          amount: roomBill.extraPay,
        };
      }
      const checkoutUrl = await this.buildCheckoutUrl(user.id, payload);
      await t.commit();
      return res.onSuccess(
        { bill: roomBill, checkoutUrl },
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
      const roomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!roomBill) {
        return res.onError({
          status: 404,
          detail: "Room bill not found",
        });
      }

      if (data?.paymentStatus) {
        roomBill.paymentStatus = data.paymentStatus;
        await this.roomBillDetailsModel.update(
          {
            paymentStatus: data.paymentStatus,
          },
          {
            where: {
              billId: billId,
            },
            transaction: t,
          }
        );
        if (data.paymentStatus === EPaymentStatus.PAID && roomBill.oldBillId) {
          // get old room bill
          const oldRoomBill = await this.roomBillsModel.findOne({
            where: {
              id: roomBill.oldBillId,
            },
          });
          if (!oldRoomBill) {
            return res.onError({
              status: 404,
              detail: "Old room bill not found",
            });
          }

          // handle check room
          const oldRoomBillDetails = await this.roomBillDetailsModel.findAll({
            where: {
              billId: roomBill.oldBillId,
            },
          });
          const oldRoomIds: number[] = [];
          oldRoomBillDetails.forEach((item) => {
            if (!oldRoomIds.includes(item.roomId)) oldRoomIds.push(item.roomId);
          });
          const oldCheckRooms = await this.checkRoomsModel.findAll({
            where: {
              roomId: oldRoomIds,
              bookedDate: {
                [Op.and]: {
                  [Op.gte]: oldRoomBill.startDate,
                  [Op.lt]: oldRoomBill.endDate,
                },
              },
            },
          });
          const updateCheckRooms: any = [];
          oldCheckRooms.map((checkRoom) => {
            const findCheckRoom = oldRoomBillDetails.find(
              (item) =>
                item.roomId === checkRoom.roomId &&
                moment(item.bookedDate).format("DD/MM/YYYY") === moment(checkRoom.bookedDate).format("DD/MM/YYYY")
            );
            if (findCheckRoom) {
              updateCheckRooms.push({
                id: checkRoom.id,
                numberOfRoomsAvailable: checkRoom.numberOfRoomsAvailable + findCheckRoom.amount,
              });
            }
          });
          await Promise.all(
            updateCheckRooms.map(
              async (item: any) =>
                await this.checkRoomsModel.update(
                  {
                    numberOfRoomsAvailable: item.numberOfRoomsAvailable,
                  },
                  {
                    where: {
                      id: item.id,
                    },
                    transaction: t,
                  }
                )
            )
          );
          await this.roomBillDetailsModel.update(
            {
              status: EBillStatus.RESCHEDULED,
            },
            {
              where: {
                billId: roomBill.oldBillId,
              },
              transaction: t,
            }
          );
        }
        await roomBill.save({ transaction: t });
      }

      await t.commit();
      return res.onSuccess(roomBill, {
        message: res.locals.t("room_bill_update_success"),
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
      const bills = await this.roomBillsModel.findAndCountAll({
        where: {
          userId: user.id,
          status: { [Op.not]: EBillStatus.RESCHEDULED },
        },
        include: [
          {
            association: "roomBillDetail",
            order: [
              ["roomId", "ASC"],
              ["bookedDate", "ASC"],
            ],
          },
          {
            association: "oldBillData",
            include: [
              {
                association: "roomBillDetail",
                order: [
                  ["roomId", "ASC"],
                  ["bookedDate", "ASC"],
                ],
              },
            ],
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

  public async findOne(billId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const bill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
          userId: user.id,
        },
        include: [
          {
            association: "roomBillDetail",
            order: [
              ["roomId", "ASC"],
              ["bookedDate", "ASC"],
            ],
          },
          {
            association: "oldBillData",
            include: [
              {
                association: "roomBillDetail",
                order: [
                  ["roomId", "ASC"],
                  ["bookedDate", "ASC"],
                ],
              },
            ],
          },
        ],
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      return res.onSuccess(bill, {
        message: "get_room_bill_success",
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findLatest(stayId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const bill = await this.roomBillsModel.findOne({
        where: {
          userId: user.id,
          stayId: stayId,
          status: EBillStatus.USED,
        },
        order: [["createdAt", "DESC"]],
      });
      if (!bill) {
        return res.onSuccess(null, {
          message: res.locals.t("get_room_bill_latest_success"),
        });
      }
      return res.onSuccess(bill, {
        message: res.locals.t("get_room_bill_latest_success"),
      });
    } catch (error) {
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
      const roomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
          userId: user.id,
        },
      });
      if (!roomBill) {
        return res.onError({
          status: 404,
          detail: "Room bill not found",
        });
      }

      roomBill.status = EBillStatus.CANCELED;
      roomBill.moneyRefund = data.moneyRefund;
      await roomBill.save({ transaction: t });

      await this.roomBillDetailsModel.update(
        {
          status: EBillStatus.CANCELED,
        },
        {
          where: {
            billId: roomBill.id,
          },
        }
      );

      // handle check room
      const roomBillDetails = await this.roomBillDetailsModel.findAll({
        where: {
          billId: roomBill.id,
        },
      });
      const oldRoomIds: number[] = [];
      roomBillDetails.forEach((item) => {
        if (!oldRoomIds.includes(item.roomId)) oldRoomIds.push(item.roomId);
      });
      const oldCheckRooms = await this.checkRoomsModel.findAll({
        where: {
          roomId: oldRoomIds,
          bookedDate: {
            [Op.and]: {
              [Op.gte]: roomBill.startDate,
              [Op.lt]: roomBill.endDate,
            },
          },
        },
      });
      const updateCheckRooms: any = [];
      oldCheckRooms.map((checkRoom) => {
        const findCheckRoom = roomBillDetails.find(
          (item) =>
            item.roomId === checkRoom.roomId &&
            moment(item.bookedDate).format("DD/MM/YYYY") === moment(checkRoom.bookedDate).format("DD/MM/YYYY")
        );
        if (findCheckRoom) {
          updateCheckRooms.push({
            id: checkRoom.id,
            numberOfRoomsAvailable: checkRoom.numberOfRoomsAvailable + findCheckRoom.amount,
          });
        }
      });
      await Promise.all(
        updateCheckRooms.map(
          async (item: any) =>
            await this.checkRoomsModel.update(
              {
                numberOfRoomsAvailable: item.numberOfRoomsAvailable,
              },
              {
                where: {
                  id: item.id,
                },
                transaction: t,
              }
            )
        )
      );

      await t.commit();
      return res.onSuccess(roomBill, {
        message: res.locals.t("cancel_room_bill_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
