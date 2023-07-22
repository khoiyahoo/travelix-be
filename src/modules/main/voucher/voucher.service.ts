import { Inject, Service } from "typedi";
import { FindAll } from "./voucher.models";
import { Response } from "express";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { EServiceType } from "common/general";

@Service()
export default class EventService {
  constructor(@Inject("eventsModel") private eventsModel: ModelsInstance.Events) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      let whereOptions: WhereOptions = {
        parentLanguage: null,
        isDeleted: false,
        owner: data?.owner,
        endTime: {
          [Op.gt]: new Date(),
        },
      };
      if (data.serviceType === EServiceType.HOTEL) {
        whereOptions = {
          ...whereOptions,
          [Op.or]: [
            { hotelIds: { [Op.substring]: `[${data.serviceId}]` } },
            { hotelIds: { [Op.substring]: `[${data.serviceId},` } },
            { hotelIds: { [Op.substring]: `,${data.serviceId},` } },
            { hotelIds: { [Op.substring]: `,${data.serviceId}]` } },
            { hotelIds: { [Op.substring]: "-1" } },
            // Sequelize.fn("JSON_CONTAINS", Sequelize.col("hotelIds"), `[${data.serviceId}]`),
            // Sequelize.fn("JSON_CONTAINS", Sequelize.col("hotelIds"), `[-1]`),
          ],
        };
      } else {
        whereOptions = {
          ...whereOptions,
          [Op.or]: [
            { tourIds: { [Op.substring]: `[${data.serviceId}]` } },
            { tourIds: { [Op.substring]: `[${data.serviceId},` } },
            { tourIds: { [Op.substring]: `,${data.serviceId},` } },
            { tourIds: { [Op.substring]: `,${data.serviceId}]` } },
            { tourIds: { [Op.substring]: "-1" } },
            // Sequelize.fn("JSON_CONTAINS", Sequelize.col("tourIds"), `[${data.serviceId}]`),
            // Sequelize.fn("JSON_CONTAINS", Sequelize.col("tourIds"), `[-1]`),
          ],
        };
      }

      const offset = data.take * (data.page - 1);

      const listVouchers = await this.eventsModel.findAndCountAll({
        where: whereOptions,
        order: [
          ["discountType", "DESC"],
          ["discountValue", "DESC"],
        ],
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
      const enterpriseId = user.enterpriseId || user.id;

      const eventWhereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };
      const voucher = await this.eventsModel.findOne({
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
}
