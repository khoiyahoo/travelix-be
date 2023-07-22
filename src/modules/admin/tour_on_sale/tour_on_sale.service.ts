/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { Response } from "express";
import { sequelize } from "database/models";

@Service()
export default class TourOnSaleService {
  constructor(
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales,
  ) {}
  public async updateReceivedRevenue(id: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourOnSale = await this.tourOnSalesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!tourOnSale) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      tourOnSale.isReceivedRevenue = true;
      await tourOnSale.save();
      await t.commit();
      return res.onSuccess(tourOnSale, {
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
}
