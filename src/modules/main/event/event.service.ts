import { Inject, Service } from "typedi";
import { FindAll, FindOne } from "./event.models";
import { Response } from "express";
import { Op, WhereOptions } from "sequelize";
import GetLanguage from "services/getLanguage";
import { eventLangFields } from "models/langField";

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
        endTime: {
          [Op.gte]: new Date(),
        },
      };

      const offset = data.take * (data.page - 1);

      const listEvents = await this.eventsModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
        ],
        order: [["startTime", "ASC"]],
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

  public async findByCode(code: string, res: Response) {
    try {
      const eventWhereOptions: WhereOptions = {
        code: code,
        isDeleted: false,
        owner: null,
      };
      const event = await this.eventsModel.findOne({
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

      return res.onSuccess(event);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
