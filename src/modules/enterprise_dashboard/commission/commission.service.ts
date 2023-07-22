import { Inject, Service } from "typedi";
import { FindAll } from "./commission.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";

@Service()
export default class CommissionService {
  constructor(@Inject("commissionsModel") private commissionsModel: ModelsInstance.Commissions) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, res: Response) {
    try {
      let whereOptions: WhereOptions = {};
      if (data.serviceType) {
        whereOptions = {
          serviceType: data.serviceType,
        };
      }

      const listCommissions = await this.commissionsModel.findAll({
        where: whereOptions,
      });

      return res.onSuccess(listCommissions);
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
}
