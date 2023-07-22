import { Inject, Service } from "typedi";
import { Create, FindAll, Update } from "./commission.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";
import { sequelize } from "database/models";

@Service()
export default class CommissionService {
  constructor(@Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, res: Response) {
    try {
      const whereOptions: WhereOptions = {
        serviceType: data.serviceType,
      };

      const offset = data.take * (data.page - 1);

      const listCommissions = await this.commissionsModel.findAndCountAll({
        where: whereOptions,
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listCommissions.rows, {
        meta: {
          take: data.take,
          itemCount: listCommissions.count,
          page: data.page,
          pageCount: Math.ceil(listCommissions.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(id: number, res: Response) {
    try {
      const commissionWhereOptions: WhereOptions = {
        id: id,
      };
      const commission = await this.commissionsModel.findOne({
        where: commissionWhereOptions,
      });
      if (!commission) {
        return res.onError({
          status: 404,
          detail: "Commission not found",
        });
      }

      return res.onSuccess(commission);
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
      const newCommission = await this.commissionsModel.create(
        {
          serviceType: data.serviceType,
          minPrice: data.minPrice,
          maxPrice: data.maxPrice,
          rate: data.rate,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newCommission, {
        message: res.locals.t("commssion_create_success"),
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
      const commission = await this.commissionsModel.findOne({
        where: {
          id: id,
        },
      });
      if (!commission) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Commission not found",
        });
      }

      commission.minPrice = data.minPrice;
      commission.maxPrice = data.maxPrice;
      commission.rate = data.rate;
      await commission.save({ transaction: t });

      await t.commit();
      return res.onSuccess(commission, {
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

  public async delete(id: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const whereOptions: WhereOptions = {
        id: id,
      };

      const commission = await this.commissionsModel.findOne({
        where: whereOptions,
      });
      if (!commission) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Commission not found",
        });
      }
      await commission.destroy({ transaction: t });
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
