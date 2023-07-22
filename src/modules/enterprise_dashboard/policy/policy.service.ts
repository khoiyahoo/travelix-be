/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { CreateOrUpdate, FindAll } from "./policy.models";
import { Response } from "express";
import { sequelize } from "database/models";
import { WhereOptions } from "sequelize/types";

@Service()
export default class PolicyService {
  constructor(@Inject("policiesModel") private policiesModel: ModelsInstance.Policies) {}
  public async findAll(data: FindAll, res: Response) {
    try {
      const policyWhereOptions: WhereOptions = {
        serviceId: data.serviceId,
        serviceType: data.serviceType,
      };
      const policies = await this.policiesModel.findAll({
        where: policyWhereOptions,
      });

      return res.onSuccess(policies);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createOrUpdate(data: CreateOrUpdate[], res: Response) {
    const t = await sequelize.transaction();
    try {
      const dataCreate: CreateOrUpdate[] = [];
      const dataUpdate: CreateOrUpdate[] = [];
      data.forEach((item) => {
        if (item?.id) {
          dataUpdate.push(item);
        } else {
          dataCreate.push(item);
        }
      });

      if(dataCreate.length) {
        await this.policiesModel.bulkCreate(dataCreate as any, {
          transaction: t,
        });
      }

      await Promise.all(
        dataUpdate.map(
          async (item) =>
            await this.policiesModel.update(
              {
                serviceId: item?.serviceId,
                serviceType: item?.serviceType,
                policyType: item?.policyType,
                dayRange: item?.dayRange,
                moneyRate: item?.moneyRate,
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
      return res.onSuccess({
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

  // public async update(id: number, data: Update, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const policy = await this.policiesModel.findOne({
  //       where: {
  //         id: id,
  //       },
  //     });
  //     if (!policy) {
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("common_not_found"),
  //       });
  //     }
  //     policy.policyType = data.policyType;
  //     policy.dayRange = data.dayRange;
  //     policy.moneyRate = data.moneyRate;
  //     await policy.save();
  //     await t.commit();
  //     return res.onSuccess(policy, {
  //       message: res.locals.t("policy_update_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  public async delete(id: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const policy = await this.policiesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!policy) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      await policy.destroy({ transaction: t });
      await t.commit();
      return res.onSuccess(policy, {
        message: res.locals.t("common_delete_success"),
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
