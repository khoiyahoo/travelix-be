import { Inject, Service } from "typedi";
import { Create, FindAll, FindOne, Update } from "./event.models";
import { Response } from "express";
import { WhereOptions } from "sequelize";
import { sequelize } from "database/models";
import FileService from "services/file";
import GetLanguage from "services/getLanguage";
import { eventLangFields, tourLangFields, tourScheduleLangFields } from "models/langField";

@Service()
export default class EventService {
  constructor(@Inject("eventsModel") private eventsModel: ModelsInstance.Events) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, res: Response) {
    try {
      const whereOptions: WhereOptions = {
        parentLanguage: null,
        isDeleted: false,
        owner: null,
      };

      const offset = data.take * (data.page - 1);

      const listEvents = await this.eventsModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listEvents.rows, {
        meta: {
          take: data.take,
          itemCount: listEvents.count,
          page: data.page,
          pageCount: Math.ceil(listEvents.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(id: number, data: FindOne, res: Response) {
    try {
      const eventWhereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: null,
      };
      let event = await this.eventsModel.findOne({
        where: eventWhereOptions,
        include: [
          {
            association: "languages",
          },
        ],
      });
      if (!event) {
        return res.onError({
          status: 404,
          detail: "Event not found",
        });
      }

      if (data.language) {
        event = GetLanguage.getLang(event.toJSON(), data.language, eventLangFields);
      }

      return res.onSuccess(event);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async create(data: Create, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const images = await FileService.uploadAttachments2([...files]);
      let imageUrl = null;
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!images?.length) {
        imageUrl = images[0];
      }

      const newEvent = await this.eventsModel.create(
        {
          name: data?.name,
          description: data?.description,
          startTime: data?.startTime,
          endTime: data?.endTime,
          banner: imageUrl,
          code: data?.code,
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
          isDeleted: false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newEvent, {
        message: res.locals.t("event_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(id: number, data: Update, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const event = await this.eventsModel.findOne({
        where: {
          id: id,
        },
      });
      if (!event) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Event not found",
        });
      }

      let imageUrl = null;
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!files.length) {
        if (event?.banner) {
          await FileService.deleteFiles2([event.banner]);
        }
        const images = await FileService.uploadAttachments2([...files]);
        imageUrl = images[0];
      }

      event.startTime = data?.startTime;
      event.endTime = data?.endTime;
      event.code = data?.code;
      if (imageUrl) event.banner = imageUrl;
      event.hotelIds = data?.hotelIds;
      event.tourIds = data?.tourIds;
      event.numberOfCodes = data?.numberOfCodes;
      event.discountType = data?.discountType;
      event.discountValue = data?.discountValue;
      event.minOrder = data?.minOrder;
      event.maxDiscount = data?.maxDiscount;
      event.isQuantityLimit = data?.isQuantityLimit;
      await event.save({ transaction: t });

      if (data?.language) {
        const eventLang = await this.eventsModel.findOne({
          where: {
            parentLanguage: id,
            language: data.language,
          },
        });
        if (!eventLang) {
          const eventNew = await this.eventsModel.create(
            {
              name: data?.name,
              description: data?.description,
              policy: data?.policy,
              creator: user?.id,
              isDeleted: false,
              parentLanguage: id,
              language: data.language,
            },
            { transaction: t }
          );
          await t.commit();
          return res.onSuccess(eventNew, {
            message: res.locals.t("common_update_success"),
          });
        } else {
          eventLang.name = data?.name;
          eventLang.description = data?.description;
          await eventLang.save({ transaction: t });
          await t.commit();
          return res.onSuccess(eventLang, {
            message: res.locals.t("common_update_success"),
          });
        }
      }
      event.name = data?.name;
      event.description = data?.description;
      await event.save({ transaction: t });
      await t.commit();
      return res.onSuccess(event, {
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
        parentLanguage: null,
        isDeleted: false,
        owner: null,
      };

      const event = await this.eventsModel.findOne({
        where: whereOptions,
      });
      if (!event) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Event not found",
        });
      }
      event.isDeleted = true;
      await this.eventsModel.update(
        {
          isDeleted: true,
        },
        {
          where: {
            parentLanguage: id,
          },
          transaction: t,
        }
      );
      await event.save({ transaction: t });
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
