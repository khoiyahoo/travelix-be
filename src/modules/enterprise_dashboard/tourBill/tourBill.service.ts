/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import {
  Filter,
  FindAll,
  FindAllStaffBill,
  StaffStatisticTourOnSales,
  StatisticAll,
  StatisticOneTour,
  StatisticTourOnSale,
  Update,
} from "./tourBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { EServiceType } from "common/general";
import { EBillStatus, EPaymentStatus } from "models/general";

@Service()
export default class TourBillService {
  constructor(
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("tourBillsModel") private tourBillsModel: ModelsInstance.TourBills,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions,
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales
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

  public async getFilters(data: Filter, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      // get tour filter
      const tours = await this.toursModel.findAll({
        attributes: ["id", "title"],
        where: {
          owner: enterpriseId,
          parentLanguage: null,
        },
      });
      if (!tours) {
        return res.onError({
          status: 404,
          detail: "tour_not_found",
        });
      }

      const tourIds = tours.map((item) => item.id);

      // get tour on sale filter
      let tourOnSalesWhereOption: WhereOptions = {
        tourId: tourIds,
      };
      if (data.isPast) {
        tourOnSalesWhereOption = {
          ...tourOnSalesWhereOption,
          startDate: {
            [Op.lt]: new Date(),
          },
        };
      } else {
        tourOnSalesWhereOption = {
          ...tourOnSalesWhereOption,
          startDate: {
            [Op.gte]: new Date(),
          },
        };
      }
      const tourOnSales = await this.tourOnSalesModel.findAll({
        attributes: ["id", "startDate"],
        where: tourOnSalesWhereOption,
        order: data.isPast ? [["startDate", "DESC"]] : [["startDate", "ASC"]],
      });
      if (!tourOnSales) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      const startDateArr: any = [];
      tourOnSales.forEach((item) => {
        if (!startDateArr.includes(item.startDate)) startDateArr.push(item.startDate);
      });

      const tourOnSaleFilter: any = [];
      startDateArr.forEach((_startDate: any) => {
        const satisfiedTourOnSales = tourOnSales.filter((tourOnSale) => tourOnSale.startDate === _startDate).map((item) => item.id);
        tourOnSaleFilter.push({
          tourOnSaleIds: satisfiedTourOnSales,
          startDate: _startDate,
        });
      });

      return res.onSuccess({
        tour: tours || [],
        tourOnSale: tourOnSaleFilter || [],
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const offset = data.take * (data.page - 1);
      let whereOption: WhereOptions = {
        tourOwnerId: enterpriseId,
        paymentStatus: EPaymentStatus.PAID,
      };
      if (data.tourId !== -1) {
        whereOption = {
          ...whereOption,
          tourId: data.tourId,
        };
      }
      if (data.tourOnSaleIds?.[0] !== -1) {
        whereOption = {
          ...whereOption,
          tourOnSaleId: data.tourOnSaleIds,
        };
      }
      if (data.status !== -1) {
        whereOption = {
          ...whereOption,
          status: data.status,
        };
      }
      const bills = await this.tourBillsModel.findAndCountAll({
        where: whereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      // ====== Handle expiredDate =====
      // const allBills: any[] = [];
      // bills.rows.map((item) => {
      //   if (new Date().getTime() < new Date(item?.expiredDate).getTime()) {
      //     allBills.push({
      //       ...item?.dataValues,
      //     });
      //   }
      // });
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
      const enterpriseId = user.enterpriseId || user.id;
      const bill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
          tourOwnerId: enterpriseId,
        },
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

  public async update(billId: number, data: Update, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const tourBill = await this.tourBillsModel.findOne({
        where: {
          id: billId,
          tourOwnerId: enterpriseId,
        },
      });
      if (!tourBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      if (data?.status) {
        tourBill.status = data.status;
        if (data.status === EBillStatus.CONTACTED) {
          tourBill.staffId = user.id;
        }
      }

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

  // bỏ
  public async staffStatisticTourOnSales(tourId: number, data: StaffStatisticTourOnSales, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;

      // Get all tours owned
      let listTourIds = [data.tourId];
      let listToursWhereOption: WhereOptions = {
        owner: enterpriseId,
        parentLanguage: null,
      };
      if (data.tourId !== -1) {
        listToursWhereOption = {
          ...listToursWhereOption,
          id: data.tourId,
        };
      }
      const listTours = await this.toursModel.findAll({
        // attributes: ["id", "title", "numberOfDays", "numberOfNights"],
        where: listToursWhereOption,
      });
      listTourIds = listTours.map((item) => item.id);

      // Get all tour on sales of the tour
      const offset = data.take * (data.page - 1);
      let listTourOnSalesWhereOption: WhereOptions = {
        tourId: listTourIds,
        isDeleted: false,
      };
      if (data.isPast) {
        listTourOnSalesWhereOption = {
          ...listTourOnSalesWhereOption,
          startDate: {
            [Op.lt]: new Date(),
          },
        };
      } else {
        listTourOnSalesWhereOption = {
          ...listTourOnSalesWhereOption,
          startDate: {
            [Op.gte]: new Date(),
          },
        };
      }
      const listTourOnSales = await this.tourOnSalesModel.findAndCountAll({
        attributes: ["id", "startDate", "quantity", "quantityOrdered"],
        where: listTourOnSalesWhereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const _listTourOnSaleIds = listTourOnSales.rows.map((item) => item.id);

      // Get all qualified tourBills
      const whereOption: WhereOptions = {
        tourOnSaleId: _listTourOnSaleIds,
      };
      const tourBills = await this.tourBillsModel.findAll({
        where: whereOption,
        include: [
          {
            association: "tourOnSaleInfo",
            attributes: ["id", "startDate", "quantity", "quantityOrdered"],
          },
        ],
        attributes: ["tourOnSaleId", "status", [Sequelize.fn("count", Sequelize.col("tour_bills.id")), "numberOfBills"]],
        group: ["tourOnSaleId", "status"],
      });
      if (!tourBills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      const _tourBillIds = tourBills.map((item) => item.tourOnSaleId);
      let result: any = [...tourBills];
      listTourOnSales.rows.forEach((item) => {
        if (!_tourBillIds.includes(item.id)) {
          result = [
            ...result,
            {
              tourId: item.id,
              numberOfBookings: 0,
              totalAmountChild: 0,
              totalAmountAdult: 0,
              revenue: 0,
              commission: 0,
              tourOnSaleInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.tourId - b.tourId);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listTourOnSales.count,
          page: data.page,
          pageCount: Math.ceil(listTourOnSales.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  // Enterprise

  public async statisticAll(data: StatisticAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      let tourOnSalesWhereOption: WhereOptions = {};
      // Start search
      if (data.keyword) {
        const listToursWhereOption: WhereOptions = {
          owner: enterpriseId,
          parentLanguage: null,
          title: { [Op.substring]: data.keyword },
        };
        const listTours = await this.toursModel.findAll({
          attributes: ["id", "title", "numberOfDays", "numberOfNights"],
          where: listToursWhereOption,
        });

        const _listTourIds = listTours.map((item) => item.id);

        tourOnSalesWhereOption = {
          ...tourOnSalesWhereOption,
          tourId: _listTourIds,
        };
      }
      // End search

      // get all qualified tourOnSales
      if (data.month > 0) {
        tourOnSalesWhereOption = {
          ...tourOnSalesWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      const tourOnSales = await this.tourOnSalesModel.findAll({
        attributes: ["id"],
        where: tourOnSalesWhereOption,
      });
      const listOnSaleIds = tourOnSales.map((item) => item.id);

      // get all qualified tourBills
      // let tourBillsWhereOption: WhereOptions = {
      //   tourOnSaleId: listOnSaleIds,
      // };
      // if (data.month > 0) {
      //   tourBillsWhereOption = {
      //     ...tourBillsWhereOption,
      //     [Op.and]: [
      //       Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("tour_bills.createdAt")), data.month as any),
      //       Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("tour_bills.createdAt")), data.year as any),
      //     ],
      //   };
      // }
      const tourBills = await this.tourBillsModel.findAll({
        where: {
          tourOnSaleId: listOnSaleIds,
          paymentStatus: EPaymentStatus.PAID,
          status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
        },
        include: [
          {
            association: "tourInfo",
            attributes: ["id", "title", "numberOfDays", "numberOfNights"],
          },
        ],
        attributes: [
          "tourId",
          [Sequelize.fn("count", Sequelize.col("tour_bills.id")), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amountChild")), "totalAmountChild"],
          [Sequelize.fn("sum", Sequelize.col("amountAdult")), "totalAmountAdult"],
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "tourId",
      });
      if (!tourBills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      const startPoint = (data.page - 1) * data.take;
      const result = tourBills.slice(startPoint, startPoint + data.take - 1);
      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: tourBills.length,
          page: data.page,
          pageCount: Math.ceil(tourBills.length / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneTour(tourId: number, data: StatisticOneTour, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      // Check tour owner
      const tour = await this.toursModel.findOne({
        where: {
          id: tourId,
          parentLanguage: null,
          owner: enterpriseId,
        },
      });
      if (!tour) {
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }

      // Get all tour on sales of the tour
      const offset = data.take * (data.page - 1);
      let listTourOnSalesWhereOption: WhereOptions = {
        tourId: tourId,
        isDeleted: false,
      };
      if (data.month > 0) {
        listTourOnSalesWhereOption = {
          ...listTourOnSalesWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      const listTourOnSales = await this.tourOnSalesModel.findAndCountAll({
        attributes: ["id", "startDate", "quantity", "quantityOrdered", "isReceivedRevenue"],
        where: listTourOnSalesWhereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const _listTourOnSaleIds = listTourOnSales.rows.map((item) => item.id);

      // Get all qualified tourBills
      const whereOption: WhereOptions = {
        tourOnSaleId: _listTourOnSaleIds,
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
      };
      const tourBills = await this.tourBillsModel.findAll({
        where: whereOption,
        include: [
          {
            association: "tourOnSaleInfo",
            attributes: ["id", "startDate", "quantity", "quantityOrdered", "isReceivedRevenue"],
          },
        ],
        attributes: [
          "tourOnSaleId",
          [Sequelize.fn("count", Sequelize.col("tour_bills.id")), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amountChild")), "totalAmountChild"],
          [Sequelize.fn("sum", Sequelize.col("amountAdult")), "totalAmountAdult"],
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "tourOnSaleId",
      });
      if (!tourBills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      const _tourBillIds = tourBills.map((item) => item.tourOnSaleId);
      let result: any = [...tourBills];
      listTourOnSales.rows.forEach((item) => {
        if (!_tourBillIds.includes(item.id)) {
          result = [
            ...result,
            {
              tourOnSaleId: item.id,
              numberOfBookings: 0,
              totalAmountChild: 0,
              totalAmountAdult: 0,
              revenue: 0,
              commission: 0,
              tourOnSaleInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.tourId - b.tourId);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listTourOnSales.count,
          page: data.page,
          pageCount: Math.ceil(listTourOnSales.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async getAllBillOfOneTourOnSale(tourOnSaleId: number, data: StatisticTourOnSale, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;
      const offset = data.take * (data.page - 1);
      const bills = await this.tourBillsModel.findAndCountAll({
        where: {
          tourOnSaleId: tourOnSaleId,
          tourOwnerId: enterpriseId,
          paymentStatus: EPaymentStatus.PAID,
          status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
        },
        limit: data.take,
        offset: offset,
        distinct: true,
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

  public async findAllStaffBill(staffId: number, data: FindAllStaffBill, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const offset = data.take * (data.page - 1);
      let whereOption: WhereOptions = {
        tourOwnerId: enterpriseId,
        paymentStatus: EPaymentStatus.PAID,
        staffId: staffId,
      };
      // Get all tour on sales of the tour
      let listTourOnSalesWhereOption: WhereOptions = {
        [Op.and]: [
          Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
        ],
      };
      if (data.tourId !== -1) {
        listTourOnSalesWhereOption = {
          ...listTourOnSalesWhereOption,
          tourId: data.tourId,
        };
      }
      const listTourOnSales = await this.tourOnSalesModel.findAll({
        attributes: ["id"],
        where: listTourOnSalesWhereOption,
      });
      const _listTourOnSaleIds = listTourOnSales.map((item) => item.id);

      whereOption = {
        ...whereOption,
        tourOnSaleId: _listTourOnSaleIds,
      };

      // filter
      if (data.status !== -1) {
        whereOption = {
          ...whereOption,
          status: data.status,
        };
      }

      const bills = await this.tourBillsModel.findAndCountAll({
        where: whereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
        order: [
          ["tourOnSaleId", "ASC"],
          ["tourId", "ASC"],
        ],
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
}
