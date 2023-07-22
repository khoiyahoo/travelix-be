import { Inject, Service } from "typedi";
import { FindAll } from "./stay.models";
import { Response } from "express";
import { Op, Order, WhereOptions } from "sequelize";
import GetLanguage from "services/getLanguage";
import { stayLangFields } from "models/langField";
import { EServiceType } from "common/general";
import { ESortOption } from "models/general";

@Service()
export default class TourService {
  constructor(
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("checkRoomsModel") private checkRoomsModel: ModelsInstance.CheckRooms
  ) {}
  public async findAll(data: FindAll, res: Response) {
    try {
      const lang = res.locals.language;
      let whereOptions: WhereOptions = {
        parentLanguage: null,
        isDeleted: false,
      };

      if (!isNaN(data?.numberOfAdult) && !isNaN(data?.numberOfChildren)) {
        const rooms = await this.roomsModel.findAll({
          where: {
            numberOfAdult: data?.numberOfAdult,
            numberOfChildren: data?.numberOfChildren,
            numberOfRoom: {
              [Op.gte]: data.numberOfRoom,
            },
          },
        });
        const roomIds = rooms.map((item) => item.id);

        const checkRooms = await this.checkRoomsModel.findAll({
          attributes: [
            "id",
            "bookedDate",
            "roomId",
            "numberOfRoomsAvailable"
          ],
          where: {
            roomId: roomIds,
            bookedDate: {
              [Op.between]: [data?.startDate, data?.endDate],
            },
            numberOfRoomsAvailable: {
              [Op.lt]: data.numberOfRoom,
            },
          },
          group: "roomId",
        });
        const roomNotEnoughIds = checkRooms.map(item => item.roomId)

        const qualifiedStayIds: number[] = []
        rooms.forEach((item) => {
          if(!roomNotEnoughIds.includes(item.id) && !qualifiedStayIds.includes(item.stayId)) {
            qualifiedStayIds.push(item.stayId)
          }
        })

        whereOptions = {
          ...whereOptions,
          id: qualifiedStayIds,
        };
      }

      if (data?.keyword) {
        whereOptions = {
          ...whereOptions,
          [Op.or]: [
            { name: { [Op.substring]: data.keyword } },
            { city: { [Op.substring]: data.keyword } },
            { district: { [Op.substring]: data.keyword } },
            { commune: { [Op.substring]: data.keyword } },
            { moreLocation: { [Op.substring]: data.keyword } },
          ],
        };
      }

      let order: Order = null;
      if (!isNaN(data?.sort)) {
        switch (data.sort) {
          case ESortOption.LOWEST_PRICE:
            order = [["minPrice", "ASC"]];
            break;
          case ESortOption.HIGHEST_PRICE:
            order = [["maxPrice", "DESC"]];
            break;
          case ESortOption.HIGHEST_RATE:
            order = [["rate", "DESC"]];
            break;
        }
      }

      const offset = data.take * (data.page - 1);

      const listStays = await this.staysModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
          {
            association: "stayPolicies",
            where: {
              serviceType: EServiceType.HOTEL,
            },
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
        order: order,
      });

      const result = GetLanguage.getLangListModel<ModelsAttributes.Stay>(listStays.rows, lang, stayLangFields);

      return res.onSuccess(result, {
        meta: {
          take: data.take,
          itemCount: listStays.count,
          page: data.page,
          pageCount: Math.ceil(listStays.count / data.take),
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
      const lang = res.locals.language;
      const whereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
      };
      let stay = await this.staysModel.findOne({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
          {
            association: "stayPolicies",
            where: {
              serviceType: EServiceType.HOTEL,
            },
          },
        ],
      });
      if (!stay) {
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }

      stay = GetLanguage.getLang(stay.toJSON(), lang, stayLangFields);

      return res.onSuccess(stay);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
