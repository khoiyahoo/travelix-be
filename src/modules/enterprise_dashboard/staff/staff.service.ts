/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { FindAll, SendOffer, StatisticRoomBill, StatisticTourBill } from "./staff.models";
import { Response } from "express";
import { Op, Order, Sequelize, WhereOptions } from "sequelize";
import EmailService from "services/emailService";
import { sequelize } from "database/models";
import { ETypeUser, ETypeVerifyCode } from "common/general";
import moment from "moment";
import { ESortStaffRevenueOption } from "models/general";

@Service()
export default class StaffService {
  constructor(
    @Inject("usersModel") private usersModel: ModelsInstance.Users,
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales,
    @Inject("tourBillsModel") private tourBillsModel: ModelsInstance.TourBills,
    @Inject("roomBillsModel") private roomBillsModel: ModelsInstance.TourBills,
    @Inject("verifyCodesModel") private verifyCodesModel: ModelsInstance.VerifyCodes
  ) {}
  /**
   * Get all user profile
   */
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const whereOptions: WhereOptions = {
        isDeleted: false,
        enterpriseId: user.id,
      };

      const offset = data.take * (data.page - 1);

      const listUsers = await this.usersModel.findAndCountAll({
        where: whereOptions,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listUsers.rows, {
        meta: {
          take: data.take,
          itemCount: listUsers.count,
          page: data.page,
          pageCount: Math.ceil(listUsers.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * offer staff
   */
  public async sendOffer(data: SendOffer, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const staff = await this.usersModel.findOne({
        where: {
          username: data.email,
          enterpriseId: null,
        },
      });
      if (!staff) {
        return res.onError({
          status: 404,
          detail: res.locals.t("auth_user_not_found"),
        });
      }
      const offerStaff = await this.verifyCodesModel.create(
        {
          userId: user.id,
          type: ETypeVerifyCode.OFFER_STAFF,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate(),
          staffId: staff.id,
        },
        {
          transaction: t,
        }
      );
      if (!offerStaff) {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "common_failed",
        });
      }
      const emailRes = await EmailService.sendResquestStaff(
        staff?.username,
        `${process.env.SITE_URL}/auth/verifyStaff?offerId=${offerStaff.id}`
      );
      if (!emailRes.isSuccess) {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "email_sending_failed",
        });
      }
      await t.commit();
      return res.onSuccess(
        {},
        {
          message: res.locals.t("common_success"),
        }
      );
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * offer staff
   */
  public async cancelSendOffer(offerId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const offer = await this.verifyCodesModel.findOne({
        where: {
          id: offerId,
        },
      });
      if (!offer) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      await offer.destroy({ transaction: t });
      await t.commit();
      return res.onSuccess(offer, {
        message: res.locals.t("common_cancel_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * accept offer
   */
  public async acceptOffer(offerId: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const offer = await this.verifyCodesModel.findOne({
        where: {
          id: offerId,
          staffId: user.id,
        },
      });
      if (!offer) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      const staff = await this.usersModel.findOne({
        where: {
          id: user.id,
          isDeleted: false,
        },
      });
      if (!staff) {
        return res.onError({
          status: 404,
          detail: res.locals.t("staff_not_found"),
        });
      }
      staff.becomeStaffDate = new Date();
      staff.enterpriseId = offer.userId;
      staff.role = ETypeUser.STAFF;
      await offer.destroy({ transaction: t });
      await staff.save({ transaction: t });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
  /**
   * Get all offer
   */
  public async findAllOffers(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      const whereOptions: WhereOptions = {
        userId: user.id,
        type: ETypeVerifyCode.OFFER_STAFF,
      };

      const offset = data.take * (data.page - 1);

      const listOffers = await this.verifyCodesModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "offers",
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listOffers.rows, {
        meta: {
          take: data.take,
          itemCount: listOffers.count,
          page: data.page,
          pageCount: Math.ceil(listOffers.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Delete staff
   */
  public async delete(staffId: number, user: ModelsAttributes.User, res: Response) {
    try {
      const staff = await this.usersModel.findOne({
        where: {
          id: staffId,
          enterpriseId: user.id,
        },
      });
      if (!staff) {
        return res.onError({
          status: 404,
          detail: res.locals.t("auth_user_not_found"),
        });
      }
      staff.becomeStaffDate = null;
      staff.enterpriseId = null;
      staff.role = ETypeUser.USER;
      await staff.save({ silent: true });
      return res.onSuccess(
        {},
        {
          message: res.locals.t("common_update_success"),
        }
      );
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Statistic for tour bill
   */
  public async statisticTourBill(data: StatisticTourBill, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      // Get all tours owned
      const listToursWhereOption: WhereOptions = {
        owner: enterpriseId,
        parentLanguage: null,
      };
      const listTours = await this.toursModel.findAndCountAll({
        attributes: ["id"],
        where: listToursWhereOption,
      });
      const _listTourIds = listTours.rows.map((item) => item.id);

      let whereOption: WhereOptions = {
        tourOwnerId: enterpriseId,
      };
      if (data.month > 0) {
        const listTourOnSalesWhereOption: WhereOptions = {
          tourId: _listTourIds,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
        const listTourOnSales = await this.tourOnSalesModel.findAll({
          attributes: ["id"],
          where: listTourOnSalesWhereOption,
        });
        const _listTourOnSaleIds = listTourOnSales.map((item) => item.id);
        whereOption = {
          ...whereOption,
          tourOnSaleId: _listTourOnSaleIds,
        };
      }
      let order: Order = null;
      if (!isNaN(data?.sort)) {
        switch (data.sort) {
          case ESortStaffRevenueOption.LOWEST_BILL:
            order = [[Sequelize.col("numberOfBills"), "ASC"]];
            break;
          case ESortStaffRevenueOption.HIGHEST_BILL:
            order = [[Sequelize.col("numberOfBills"), "DESC"]];
            break;
          case ESortStaffRevenueOption.LOWEST_REVENUE:
            order = [[Sequelize.col("revenue"), "ASC"]];
            break;
          case ESortStaffRevenueOption.HIGHEST_REVENUE:
            order = [[Sequelize.col("revenue"), "DESC"]];
            break;
        }
      }
      const statistics = await this.tourBillsModel.findAll({
        where: whereOption,
        attributes: [
          "staffId",
          [Sequelize.fn("count", Sequelize.col("tour_bills.id")), "numberOfBills"],
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
        ],
        include: [
          {
            association: "staffInfo",
          },
        ],
        group: "staffId",
        order: order,
      });

      const startPoint = (data.page - 1) * data.take;
      const result = statistics.slice(startPoint, startPoint + data.take - 1);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: statistics.length,
          page: data.page,
          pageCount: Math.ceil(statistics.length / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Statistic for room bill
   */
  public async statisticRoomBill(data: StatisticRoomBill, user: ModelsAttributes.User, res: Response) {
    try {
      const enterpriseId = user.id;

      let whereOption: WhereOptions = {
        stayOwnerId: enterpriseId,
      };
      if (data.month > 0) {
        whereOption = {
          ...whereOption,
          [Op.and]: [
            Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("startDate")), data.month as any),
            Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("startDate")), data.year as any),
          ],
        };
      }
      let order: Order = null;
      if (!isNaN(data?.sort)) {
        switch (data.sort) {
          case ESortStaffRevenueOption.LOWEST_BILL:
            order = [[Sequelize.col("numberOfBills"), "ASC"]];
            break;
          case ESortStaffRevenueOption.HIGHEST_BILL:
            order = [[Sequelize.col("numberOfBills"), "DESC"]];
            break;
          case ESortStaffRevenueOption.LOWEST_REVENUE:
            order = [[Sequelize.col("revenue"), "ASC"]];
            break;
          case ESortStaffRevenueOption.HIGHEST_REVENUE:
            order = [[Sequelize.col("revenue"), "DESC"]];
            break;
        }
      }
      const statistics = await this.roomBillsModel.findAll({
        where: whereOption,
        attributes: [
          "staffId",
          [Sequelize.fn("count", Sequelize.col("room_bills.id")), "numberOfBills"],
          [Sequelize.fn("sum", Sequelize.col("totalBill")), "revenue"],
        ],
        include: [
          {
            association: "staffInfo",
          },
        ],
        group: "staffId",
        order: order,
      });

      const startPoint = (data.page - 1) * data.take;
      const result = statistics.slice(startPoint, startPoint + data.take - 1);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: statistics.length,
          page: data.page,
          pageCount: Math.ceil(statistics.length / data.take),
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
