import { Inject, Service } from "typedi";
import { Create, FindAll, FindOne, Update } from "./voucher.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";
import { sequelize } from "database/models";
import GetLanguage from "services/getLanguage";
import { eventLangFields } from "models/langField";
import moment from "moment";

@Service()
export default class EventService {
  constructor(@Inject("eventsModel") private eventsModel: ModelsInstance.Events) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      let enterpriseId = user.enterpriseId || user.id;

      let whereOptions: WhereOptions = {
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };

      let offset = data.take * (data.page - 1);

      const listVouchers = await this.eventsModel.findAndCountAll({
        where: whereOptions,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listVouchers.rows, {
        meta: {
          take: data.take,
          itemCount: listVouchers.count,
          page: data.page,
          pageCount: Math.ceil(listVouchers.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(id: number, user: ModelsAttributes.User, res: Response) {
    try {
      let enterpriseId = user.enterpriseId || user.id;

      let eventWhereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };
      let voucher = await this.eventsModel.findOne({
        where: eventWhereOptions,
      });
      if (!voucher) {
        return res.onError({
          status: 404,
          detail: "Voucher not found",
        });
      }

      return res.onSuccess(voucher);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async create(data: Create, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const newVoucher = await this.eventsModel.create(
        {
          startTime: data?.startTime,
          endTime: data?.endTime,
          hotelIds: data?.hotelIds,
          tourIds: data?.tourIds,
          numberOfCodes: data?.numberOfCodes,
          discountType: data?.discountType,
          discountValue: data?.discountValue,
          minOrder: data?.minOrder,
          maxDiscount: data?.maxDiscount,
          isQuantityLimit: data?.isQuantityLimit,
          numberOfCodesUsed: 0,
          creator: user?.id,
          owner: user.enterpriseId || user.id,
          isDeleted: false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newVoucher, {
        message: res.locals.t("voucher_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(id: number, data: Update, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const voucher = await this.eventsModel.findOne({
        where: {
          id: id,
        },
      });
      if (!voucher) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Voucher not found",
        });
      }
      if(moment(voucher.startTime).isAfter(moment())){
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Unable to edit started voucher",
        });
      }

      voucher.startTime = data?.startTime;
      voucher.endTime = data?.endTime;
      voucher.hotelIds = data?.hotelIds;
      voucher.tourIds = data?.tourIds;
      voucher.numberOfCodes = data?.numberOfCodes;
      voucher.discountType = data?.discountType;
      voucher.discountValue = data?.discountValue;
      voucher.minOrder = data?.minOrder;
      voucher.maxDiscount = data?.maxDiscount;
      voucher.isQuantityLimit = data?.isQuantityLimit;
      await voucher.save({ transaction: t });
      await t.commit();
      return res.onSuccess(voucher, {
        message: res.locals.t("common_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async delete(id: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      let enterpriseId = user.enterpriseId || user.id;
      let whereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };

      let voucher = await this.eventsModel.findOne({
        where: whereOptions,
      });
      if (!voucher) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Voucher not found",
        });
      }
      voucher.isDeleted = true;
      await voucher.save({ transaction: t });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("common_delete_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
