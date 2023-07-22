/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { FindAll, FindAllStaffBill, StatisticAll, StatisticOneStay, StatisticRoom, Update } from "./roomBill.models";
import { sequelize } from "database/models";
import { Response } from "express";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { EServiceType } from "common/general";
import { EBillStatus, EPaymentStatus } from "models/general";

@Service()
export default class TourBillService {
  constructor(
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.RoomBills,
    @Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions,
    @Inject("roomBillDetailsModel") private roomBillDetailsModel: ModelsInstance.RoomBillDetails
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

  public async getFilters(user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
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

  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const offset = data.take * (data.page - 1);
      let whereOption: WhereOptions = {
        stayOwnerId: enterpriseId,
        stayId: data.stayId,
      };
      if (data?.roomId) {
        const roomBillDetails = await this.roomBillDetailsModel.findAll({
          attributes: ["id", "billId"],
          where: {
            stayOwnerId: enterpriseId,
            stayId: data.stayId,
            roomId: data.roomId,
          },
          group: "billId",
        });
        const roomBillDetailIds = roomBillDetails.map((item) => item.billId);
        whereOption = {
          ...whereOption,
          id: roomBillDetailIds,
        };
      }
      if (data?.date) {
        whereOption = {
          ...whereOption,
          startDate: {
            [Op.gte]: new Date(data.date),
          },
          endDate: {
            [Op.lt]: new Date(data.date),
          },
        };
      }
      if (data.status !== -1) {
        whereOption = {
          ...whereOption,
          status: data.status,
        };
      }
      const bills = await this.roomBillsModel.findAndCountAll({
        where: whereOption,
        include: [
          {
            association: "roomBillDetail",
            include: [
              {
                attributes: ["title"],
                association: "roomInfo",
              },
            ],
            order: [
              ["roomId", "ASC"],
              ["bookedDate", "ASC"],
            ],
          },
        ],
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

      const result = bills.rows?.map((bill) => {
        const bookedRoomsInfo: any[] = [];
        const bookedRoomIds: number[] = [];
        bill.roomBillDetail.forEach((item) => {
          if (!bookedRoomIds.includes(item.roomId)) {
            bookedRoomIds.push(item.roomId);
            bookedRoomsInfo.push({
              title: item.roomInfo.title,
              amount: item.amount,
            });
          }
        });
        return {
          ...bill.dataValues,
          stayData: JSON.parse(bill.dataValues.stayData),
          bookedRoomsInfo: bookedRoomsInfo,
        };
      });

      return res.onSuccess(result, {
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
      const bill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
          stayOwnerId: enterpriseId,
        },
        include: [
          {
            association: "roomBillDetail",
            order: [
              ["roomId", "ASC"],
              ["bookedDate", "ASC"],
            ],
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
        message: res.locals.t("get_room_bill_success"),
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
      const roomBill = await this.roomBillsModel.findOne({
        where: {
          id: billId,
          stayOwnerId: enterpriseId,
        },
      });
      if (!roomBill) {
        return res.onError({
          status: 404,
          detail: "Tour bill not found",
        });
      }

      if (data?.status) {
        roomBill.status = data.status;
        if (data.status === EBillStatus.CONTACTED) {
          roomBill.staffId = user.id;
        }
      }

      await roomBill.save({ transaction: t });
      await t.commit();
      return res.onSuccess(roomBill, {
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

  //
  // Enterprise

  public async statisticAll(data: StatisticAll, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      // Statistic by roomBillDetail
      let roomBillsWhereOption: WhereOptions = {
        stayOwnerId: enterpriseId,
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
      };

      // Start search
      if (data.keyword) {
        const listStaysWhereOption: WhereOptions = {
          owner: enterpriseId,
          parentLanguage: null,
          name: { [Op.substring]: data.keyword },
        };
        const listStays = await this.staysModel.findAll({
          attributes: ["id", "name", "type"],
          where: listStaysWhereOption,
        });

        const _listStayIds = listStays.map((item) => item.id);
        roomBillsWhereOption = {
          ...roomBillsWhereOption,
          stayId: _listStayIds,
        };
      }
      // End search

      if (data.month > 0) {
        roomBillsWhereOption = {
          ...roomBillsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      const roomBillDetails = await this.roomBillsModel.findAll({
        where: roomBillsWhereOption,
        include: [
          {
            association: "stayInfo",
            attributes: ["id", "name", "type"],
          },
          {
            association: "roomBillDetail",
            attributes: ["id", "roomId", "billId", "amount"],
          },
        ],
        attributes: [
          "stayId",
          // [Sequelize.literal("COUNT(DISTINCT(billId))"), "numberOfBookings"],
          [Sequelize.fn("count", Sequelize.col("room_bills.id")), "numberOfBookings"],
          // [Sequelize.fn("sum", Sequelize.col("amount")), "totalNumberOfRoom"],
          [Sequelize.fn("sum", Sequelize.col("room_bills.totalBill")), "revenue"],
          [Sequelize.fn("sum", Sequelize.col("room_bills.commission")), "commission"],
        ],
        group: "stayId",
      });

      const startPoint = (data.page - 1) * data.take;
      const result = roomBillDetails
        .map((roomBill) => {
          let totalNumberOfRoom = 0;
          roomBill.roomBillDetail.forEach((item) => (totalNumberOfRoom = totalNumberOfRoom + item.amount));
          return {
            ...roomBill.dataValues,
            totalNumberOfRoom,
          };
        })
        .slice(startPoint, startPoint + data.take - 1);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: roomBillDetails.length,
          page: data.page,
          pageCount: Math.ceil(roomBillDetails.length / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneStay(stayId: number, data: StatisticOneStay, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;
      const offset = data.take * (data.page - 1);

      // Check stay owner
      const stay = await this.staysModel.findOne({
        where: {
          id: stayId,
          parentLanguage: null,
          owner: enterpriseId,
        },
      });
      if (!stay) {
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }

      let roomBillsWhereOption: WhereOptions = {
        stayOwnerId: enterpriseId,
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
        stayId: stayId,
      };
      if (data.month > 0) {
        roomBillsWhereOption = {
          ...roomBillsWhereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      const roomBills = await this.roomBillsModel.findAndCountAll({
        where: roomBillsWhereOption,
        include: [
          {
            association: "roomBillDetail",
            attributes: ["id", "amount"],
            include: [
              {
                association: "roomInfo",
                attributes: ["id", "title"]
              }
            ]
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      const result = roomBills.rows.map((roomBill) => {
        const roomBillDetails: any[] = []
        const roomIds: number[] = []
        roomBill.roomBillDetail.forEach((item) => {
          if(!roomIds.includes(item.roomInfo.id)) {
            roomIds.push(item.roomInfo.id)
            roomBillDetails.push({
              title: item.roomInfo.title,
              amount: item.amount
            })
          }
        })
        return {
          ...roomBill.dataValues,
          roomBillDetail: roomBillDetails
        }
      })

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: roomBills.count,
          page: data.page,
          pageCount: Math.ceil(roomBills.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async statisticOneRoom(roomId: number, data: StatisticRoom, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      // Statistic by roomBillDetail
      let roomBillDetailsWhereOption: WhereOptions = {
        roomId: roomId,
        paymentStatus: EPaymentStatus.PAID,
        status: { [Op.notIn]: [EBillStatus.CANCELED, EBillStatus.RESCHEDULED, EBillStatus.WAITING_RESCHEDULE_SUCCESS] },
        stayOwnerId: enterpriseId,
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

  public async findAllStaffBill(staffId: number, data: FindAllStaffBill, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const offset = data.take * (data.page - 1);
      let whereOption: WhereOptions = {
        stayOwnerId: enterpriseId,
        stayId: data.stayId,
        staffId: staffId,
        [Op.and]: [
          Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
          Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
        ],
      };
      if (data.status !== -1) {
        whereOption = {
          ...whereOption,
          status: data.status,
        };
      }
      const bills = await this.roomBillsModel.findAndCountAll({
        where: whereOption,
        include: [
          {
            association: "roomBillDetail",
            include: [
              {
                attributes: ["title"],
                association: "roomInfo",
              },
            ],
            order: [
              ["roomId", "ASC"],
              ["bookedDate", "ASC"],
            ],
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
        order: [["startDate", "ASC"]],
      });
      if (!bills) {
        return res.onError({
          status: 404,
          detail: "not_found",
        });
      }

      const result = bills.rows?.map((bill) => {
        const bookedRoomsInfo: any[] = [];
        const bookedRoomIds: number[] = [];
        bill.roomBillDetail.forEach((item) => {
          if (!bookedRoomIds.includes(item.roomId)) {
            bookedRoomIds.push(item.roomId);
            bookedRoomsInfo.push({
              title: item.roomInfo.title,
              amount: item.amount,
            });
          }
        });
        return {
          ...bill.dataValues,
          stayData: JSON.parse(bill.dataValues.stayData),
          bookedRoomsInfo: bookedRoomsInfo,
        };
      });

      return res.onSuccess(result, {
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
