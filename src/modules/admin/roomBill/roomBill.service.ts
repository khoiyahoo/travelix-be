/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import {
  ESortRoomBillOption,
  StatisticOneUser,
  StatisticAllUsers,
  StatisticOneStay,
  StatisticRoom,
  FindAllOrderNeedRefund,
  FindAllStayRevenue,
} from "./roomBill.models";
import { Response } from "express";
import { Op, Order, Sequelize, WhereOptions } from "sequelize";
import { EBillStatus, EPaymentStatus } from "models/general";
import { sequelize } from "database/models";

@Service()
export default class TourBillService {
  constructor(
    @Inject("usersModel") private usersModel: ModelsInstance.Users,
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("stayRevenuesModel") private stayRevenuesModel: ModelsInstance.StayRevenues,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.RoomBills,
    @Inject("roomBillDetailsModel") private roomBillDetailsModel: ModelsInstance.RoomBillDetails
  ) {}
  public async statisticAllUsers(data: StatisticAllUsers, res: Response) {
    try {
      const offset = data.take * (data.page - 1);
      let order: Order = null;
      if (!isNaN(data?.sort)) {
        switch (data.sort) {
          case ESortRoomBillOption.LOWEST_REVENUE:
            order = [[Sequelize.col("revenue"), "ASC"]];
            break;
          case ESortRoomBillOption.HIGHEST_REVENUE:
            order = [[Sequelize.col("revenue"), "DESC"]];
            break;
        }
      }

      let usersWhereOption: WhereOptions = {};
      // ***** Start Search *********
      if (data.keyword) {
        usersWhereOption = {
          ...usersWhereOption,
          username: { [Op.substring]: data.keyword },
        };
      }
      // ***** End Search *********

      // get all qualified tourOnSales
      let roomBillDetailsWhereOption: WhereOptions = {
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }

      const statisticUsers = await this.usersModel.findAndCountAll({
        where: usersWhereOption,
        include: [
          {
            association: "listRoomBillDetails",
            where: roomBillDetailsWhereOption,
            attributes: [
              "stayOwnerId",
              [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
              [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
              [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
              [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
            ],
          },
        ],
        group: "users.id",
        limit: data.take,
        offset: offset,
        distinct: true,
        order: order,
      });
      if (!statisticUsers) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }
      return res.onSuccess(statisticUsers.rows, {
        meta: {
          take: data.take,
          itemCount: Number(statisticUsers.count),
          page: data.page,
          pageCount: Math.ceil(Number(statisticUsers.count) / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async getFiltersForStayOfUser(enterpriseId: number, res: Response) {
    try {
      // get stays filter
      const stays = await this.staysModel.findAll({
        attributes: ["id", "name"],
        where: {
          owner: enterpriseId,
          parentLanguage: null,
        },
        include: [
          {
            association: "listRooms",
            attributes: ["id", "title"],
            where: {
              parentLanguage: null,
            },
          },
        ],
      });
      if (!stays) {
        return res.onError({
          status: 404,
          detail: "stay_not_found",
        });
      }

      return res.onSuccess({ stays });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneUser(enterpriseId: number, data: StatisticOneUser, res: Response) {
    try {
      const offset = data.take * (data.page - 1);

      // Get all stays owned
      let listStaysWhereOption: WhereOptions = {
        owner: enterpriseId,
        parentLanguage: null,
      };
      if (data.keyword) {
        listStaysWhereOption = {
          [Op.and]: [{ ...listStaysWhereOption }, { name: { [Op.substring]: data.keyword } }],
        };
      }
      const listStays = await this.staysModel.findAndCountAll({
        attributes: ["id", "name", "type"],
        where: listStaysWhereOption,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const _listStayIds = listStays.rows.map((item) => item.id);

      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        stayId: _listStayIds,
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("bookedDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("bookedDate")), data.year as any),
          ],
        };
      }
      const roomBillDetails = await this.roomBillDetailsModel.findAll({
        where: roomBillDetailsWhereOption,
        include: [
          {
            association: "stayInfo",
            attributes: ["id", "name", "type"],
          },
        ],
        attributes: [
          "stayId",
          [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "stayId",
      });

      const validStayIds = roomBillDetails.map((item) => item.stayId);

      let result: any = [...roomBillDetails];
      listStays.rows.forEach((item) => {
        if (!validStayIds.includes(item.id)) {
          result = [
            ...result,
            {
              stayId: item.id,
              numberOfBookings: 0,
              revenue: 0,
              commission: 0,
              stayInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.stayId - b.stayId);
      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listStays.count,
          page: data.page,
          pageCount: Math.ceil(listStays.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneStay(stayId: number, data: StatisticOneStay, res: Response) {
    try {
      // Get all rooms of the stay
      const offset = data.take * (data.page - 1);
      const listRooms = await this.roomsModel.findAndCountAll({
        attributes: ["id", "title", "numberOfBed", "numberOfRoom", "numberOfAdult", "numberOfChildren"],
        where: {
          stayId: stayId,
          parentLanguage: null,
        },
        limit: data.take,
        offset: offset,
        distinct: true,
      });
      const _listRoomIds = listRooms.rows.map((item) => item.id);

      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        roomId: _listRoomIds,
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("bookedDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("bookedDate")), data.year as any),
          ],
        };
      }
      const roomBillDetails = await this.roomBillDetailsModel.findAll({
        where: roomBillDetailsWhereOption,
        include: [
          {
            association: "roomInfo",
            attributes: ["id", "title", "numberOfBed", "numberOfRoom", "numberOfAdult", "numberOfChildren"],
          },
        ],
        attributes: [
          "roomId",
          [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "roomId",
      });

      const validRoomIds = roomBillDetails.map((item) => item.stayId);

      let result: any = [...roomBillDetails];
      listRooms.rows.forEach((item) => {
        if (!validRoomIds.includes(item.id)) {
          result = [
            ...result,
            {
              roomId: item.id,
              numberOfBookings: 0,
              revenue: 0,
              commission: 0,
              roomInfo: item,
            },
          ];
        }
      });
      result = result.sort((a: any, b: any) => a.roomId - b.roomId);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listRooms.count,
          page: data.page,
          pageCount: Math.ceil(listRooms.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneRoom(roomId: number, data: StatisticRoom, res: Response) {
    try {
      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        roomId: roomId,
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
      };
      if (data.month > 0) {
        roomBillDetailsWhereOption = {
          ...roomBillDetailsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("bookedDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("bookedDate")), data.year as any),
          ],
        };
      }
      const roomBillDetails = await this.roomBillDetailsModel.findAll({
        where: roomBillDetailsWhereOption,
        attributes: [
          "bookedDate",
          [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("price")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        group: "bookedDate",
      });

      return res.onSuccess(roomBillDetails);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findAllOrderNeedRefund(data: FindAllOrderNeedRefund, res: Response) {
    try {
      const offset = data.take * (data.page - 1);
      let whereOption: WhereOptions = {
        moneyRefund: {
          [Op.gt]: 0,
        },
      };
      if (data.refundStatus !== -1) {
        whereOption = {
          ...whereOption,
          isRefunded: data.refundStatus === 0 ? false : true,
        };
      }
      if (data.month > 0) {
        whereOption = {
          ...whereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("updatedAt")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("updatedAt")), data.year as any),
          ],
        };
      }
      const bills = await this.roomBillsModel.findAndCountAll({
        where: whereOption,
        include: [
          {
            association: "stayInfo",
          },
          {
            attributes: [
              "username",
              "firstName",
              "lastName",
              "address",
              "phoneNumber",
              "bankType",
              "bankCode",
              "bankName",
              "bankCardNumber",
              "bankUserName",
              "releaseDate",
              "expirationDate",
              "cvcOrCvv",
              "bankEmail",
              "bankCountry",
              "bankProvinceOrCity",
              "bankUserAddress",
            ],
            association: "userInfo",
          },
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
        order: ["isRefunded", "updatedAt"],
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

  public async updateRefunded(billId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const bill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
        },
      });
      if (!bill) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      bill.isRefunded = true;
      await bill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(bill, {
        message: res.locals.t("update_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async generateQuarterlyRevenue(res: Response) {
    const t = await sequelize.transaction();
    try {
      const today = new Date("2023-6-1");
      const date = today.getDate();
      let month = today.getMonth();
      const year = today.getFullYear();
      let roomBillWhereOptions: WhereOptions = {};
      if (date === 1) {
        roomBillWhereOptions = {
          ...roomBillWhereOptions,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), year as any),
          ],
          startDate: {
            [Op.gte]: new Date(`${year}-${month}-16`),
          },
        };
      } else {
        month = month + 1;
        roomBillWhereOptions = {
          ...roomBillWhereOptions,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), year as any),
          ],
          startDate: {
            [Op.lte]: new Date(`${year}-${month}-15`),
          },
        };
      }
      const roomBills = await this.roomBillsModel.findAll({
        attributes: [
          "stayId",
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("commission")), "commission"],
        ],
        where: roomBillWhereOptions,
        group: "stayId",
      });
      const revenueCreations = roomBills.map((roomBill: any) => {
        console.log(roomBill.revenue, "====roomBill.revenue===");
        return {
          stayId: roomBill.dataValues.stayId,
          revenue: roomBill.dataValues.revenue,
          commission: roomBill.dataValues.commission,
          section: date === 1 ? 2 : 1,
          month: month,
          year: year,
        };
      });
      if (revenueCreations.length) {
        await this.stayRevenuesModel.bulkCreate(revenueCreations, {
          transaction: t,
        });
      }
      console.log(revenueCreations, roomBills, "===revenueCreations===");
      await t.commit();
      return res.onSuccess(revenueCreations);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findAllStayRevenue(data: FindAllStayRevenue, res: Response) {
    try {
      const offset = data.take * (data.page - 1);
      // Start search
      let whereOption: WhereOptions = {
        isReceivedRevenue: data.isReceivedRevenue,
        month: data.month,
        year: data.year,
        section: data.section,
      };
      if (data?.keyword) {
        const stays = await this.staysModel.findAll({
          attributes: ["id"],
          where: {
            name: { [Op.substring]: data.keyword },
          },
        });
        const stayIds = stays.map((item) => item.id);
        whereOption = {
          ...whereOption,
          stayId: stayIds,
        };
      }

      const revenues = await this.stayRevenuesModel.findAndCountAll({
        where: whereOption,
        include: [
          {
            association: "stayInfo",
            attributes: ["id", "name", "type", "owner"],
            include: [
              {
                association: "stayOwner",
                attributes: [
                  "id",
                  "username",
                  "firstName",
                  "lastName",
                  "address",
                  "phoneNumber",
                  "bankType",
                  "bankCode",
                  "bankName",
                  "bankCardNumber",
                  "bankUserName",
                ],
              },
            ],
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(revenues.rows, {
        meta: {
          take: data.take,
          itemCount: revenues.count,
          page: data.page,
          pageCount: Math.ceil(revenues.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  
  public async updateSendRevenue(revenueId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const revenue = await this.stayRevenuesModel.findOne({
        where: {
          id: revenueId,
        },
      });
      if (!revenue) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      revenue.isReceivedRevenue = true;
      await revenue.save({ transaction: t });
      await t.commit();
      return res.onSuccess(revenue, {
        message: res.locals.t("update_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
