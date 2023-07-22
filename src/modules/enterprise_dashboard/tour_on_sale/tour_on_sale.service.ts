/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { Create, FindAll, ITourOnSale, Update } from "./tour_on_sale.models";
import { Response } from "express";
import { sequelize } from "database/models";
import { Op, WhereOptions } from "sequelize";

@Service()
export default class TourOnSaleService {
  constructor(
    @Inject("tourOnSalesModel") private tourOnSalesModel: ModelsInstance.TourOnSales,
    @Inject("toursModel") private toursModel: ModelsInstance.Tours
  ) {}
  public async findAll(tourId: number, data: FindAll, res: Response) {
    try {
      let tourOnSaleWhereOptions: WhereOptions = {
        tourId: tourId,
      };
      // Get upcoming tour on sales
      tourOnSaleWhereOptions = {
        ...tourOnSaleWhereOptions,
        startDate: {
          [Op.gt]: new Date(),
        },
      };
      if (!data.isPast) {
        const tourOnSales = await this.tourOnSalesModel.findAll({
          where: tourOnSaleWhereOptions,
          order: [["startDate", "ASC"]],
        });

        return res.onSuccess(tourOnSales);
      }

      // Get tour on sales took place
      const offset = data.take * (data.page - 1);
      tourOnSaleWhereOptions = {
        ...tourOnSaleWhereOptions,
        startDate: {
          [Op.lte]: new Date(),
        },
      };
      const tourOnSales = await this.tourOnSalesModel.findAndCountAll({
        where: tourOnSaleWhereOptions,
        order: [["startDate", "DESC"]],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(tourOnSales.rows, {
        meta: {
          take: data.take,
          itemCount: tourOnSales.count,
          page: data.page,
          pageCount: Math.ceil(tourOnSales.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async create(data: Create, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourOnSale = await this.tourOnSalesModel.create(
        {
          tourId: data?.tourId,
          discount: data?.discount || 0,
          quantity: data?.quantity,
          startDate: data?.startDate,
          childrenAgeMin: data?.childrenAgeMin,
          childrenAgeMax: data?.childrenAgeMax,
          childrenPrice: data?.childrenPrice,
          adultPrice: data?.adultPrice,
          currency: data?.currency,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(tourOnSale, {
        message: res.locals.t("tour_create_success"),
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
      tourOnSale.discount = data.discount || 0;
      tourOnSale.quantity = data.quantity || 0;
      tourOnSale.startDate = data.startDate || new Date();
      tourOnSale.childrenAgeMin = data.childrenAgeMin;
      tourOnSale.childrenAgeMax = data.childrenAgeMax;
      tourOnSale.childrenPrice = data.childrenPrice;
      tourOnSale.adultPrice = data.adultPrice;
      tourOnSale.currency = data.currency;
      await tourOnSale.save();
      await t.commit();
      return res.onSuccess(tourOnSale, {
        message: res.locals.t("tour_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createOrUpdate(data: ITourOnSale[], res: Response) {
    const t = await sequelize.transaction();
    try {
      const dataCreate: ITourOnSale[] = [];
      const dataUpdate: ITourOnSale[] = [];
      const priceArr: number[] = [];
      let latestTourDate = data?.[0]?.startDate;
      data.forEach((item) => {
        priceArr.push(item.childrenPrice);
        priceArr.push(item.adultPrice);
        if (new Date(latestTourDate) < new Date(item.startDate)) {
          latestTourDate = item.startDate;
        }
        if (item?.id) {
          dataUpdate.push(item);
        } else {
          dataCreate.push(item);
        }
      });

      await this.tourOnSalesModel.bulkCreate(dataCreate as any, {
        transaction: t,
      });

      await Promise.all(
        dataUpdate.map(
          async (item) =>
            await this.tourOnSalesModel.update(
              {
                discount: item?.discount,
                quantity: item?.quantity,
                startDate: item?.startDate,
                childrenAgeMin: item?.childrenAgeMin,
                childrenAgeMax: item?.childrenAgeMax,
                childrenPrice: item?.childrenPrice,
                adultPrice: item?.adultPrice,
                currency: item?.currency,
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

      const tour = await this.toursModel.findOne({
        where: {
          id: data[0].tourId,
        },
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      tour.minPrice = Math.min(...priceArr);
      tour.maxPrice = Math.max(...priceArr);
      tour.latestTourDate = latestTourDate;
      await tour.save();

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
}
