/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { FindAll, IRoomOtherPrice } from "./roomOtherPrice.models";
import { sequelize } from "database/models";
import { Response } from "express";
import { Op, WhereOptions } from "sequelize";

@Service()
export default class RoomOtherPriceService {
  constructor(@Inject("roomOtherPricesModel") private roomOtherPricesModel: ModelsInstance.RoomOtherPrices) {}

  public async findAll(roomId: number, data: FindAll, res: Response) {
    try {
      let whereOptions: WhereOptions = {
        roomId: roomId,
      };
      // Get upcoming date
      whereOptions = {
        ...whereOptions,
        date: {
          [Op.gt]: new Date(),
        },
      };
      if (!data.isPast) {
        const prices = await this.roomOtherPricesModel.findAll({
          where: whereOptions,
          order: [["date", "ASC"]],
        });

        return res.onSuccess(prices);
      }

      // Get date took place
      const offset = data.take * (data.page - 1);
      whereOptions = {
        ...whereOptions,
        date: {
          [Op.lte]: new Date(),
        },
      };
      const prices = await this.roomOtherPricesModel.findAndCountAll({
        where: whereOptions,
        order: [["date", "DESC"]],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(prices.rows, {
        meta: {
          take: data.take,
          itemCount: prices.count,
          page: data.page,
          pageCount: Math.ceil(prices.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createOrUpdate(data: IRoomOtherPrice[], res: Response) {
    const t = await sequelize.transaction();
    try {
      const dataCreate: IRoomOtherPrice[] = [];
      const dataUpdate: IRoomOtherPrice[] = [];
      data.forEach((item) => {
        if (item?.id) {
          dataUpdate.push(item);
        } else {
          dataCreate.push(item);
        }
      });

      await this.roomOtherPricesModel.bulkCreate(dataCreate as any, {
        transaction: t,
      });

      await Promise.all(
        dataUpdate.map(
          async (item) =>
            await this.roomOtherPricesModel.update(
              {
                date: item?.date,
                price: item?.price,
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

  public async delete(id: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      await this.roomOtherPricesModel.destroy({
        where: {
          id: id,
        },
      });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("Delete successful"),
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
