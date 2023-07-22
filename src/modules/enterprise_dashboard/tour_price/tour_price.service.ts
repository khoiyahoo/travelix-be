import { Inject, Service } from "typedi";
import { Create, Update } from "./tour_price.models";
import { Response } from "express";
import { sequelize } from "database/models";

@Service()
export default class TourPriceService {
  constructor(@Inject("tourPricesModel") private tourPricesModel: ModelsInstance.TourPrices) {}
  public async create(data: Create, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourPrice = await this.tourPricesModel.create(
        {
          tourOnSaleId: data?.tourOnSaleId,
          title: data?.title,
          minOld: data?.minOld,
          maxOld: data?.maxOld,
          price: data?.price,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(tourPrice, {
        message: res.locals.t("tour_price_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(id: number, data: Update, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourPrice = await this.tourPricesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!tourPrice) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      tourPrice.title = data.title;
      tourPrice.minOld = data.minOld;
      tourPrice.maxOld = data.maxOld;
      tourPrice.price = data.price;
      await tourPrice.save();
      await t.commit();
      return res.onSuccess(tourPrice, {
        message: res.locals.t("tour_price_update_success"),
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
      const tourPrice = await this.tourPricesModel.findOne({
        where: {
          id: id,
        },
      });
      if (!tourPrice) {
        return res.onError({
          status: 404,
          detail: res.locals.t("common_not_found"),
        });
      }
      await tourPrice.destroy({ transaction: t })
      await t.commit();
      return res.onSuccess(tourPrice, {
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
