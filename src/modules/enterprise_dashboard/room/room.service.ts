/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { Create, CreateOrUpdateCheckRoom, ERoomStatusFilter, FindAll, FindOne, Update } from "./room.models";
import { Response } from "express";
import { Op, Sequelize, WhereOptions } from "sequelize";
import { sequelize } from "database/models";
import GetLanguage from "services/getLanguage";
import { roomLangFields } from "models/langField";
import FileService from "services/file";

@Service()
export default class RoomService {
  constructor(
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
    @Inject("checkRoomsModel") private checkRoomsModel: ModelsInstance.CheckRooms,
  ) {}
  /**
   * Find all
   */
  public async findAll(data: FindAll, user: ModelsAttributes.User, res: Response) {
    try {
      let whereOptions: WhereOptions = {
        parentLanguage: null,
        stayId: data.stayId,
      };

      if (data.status === ERoomStatusFilter.ACTIVED) {
        whereOptions = {
          ...whereOptions,
          isDeleted: false,
        };
      }
      if (data.status === ERoomStatusFilter.IN_ACTIVED) {
        whereOptions = {
          ...whereOptions,
          isDeleted: true,
        };
      }

      const offset = data.take * (data.page - 1);

      const listRooms = await this.roomsModel.findAndCountAll({
        where: whereOptions,
        include: [
          {
            association: "languages",
          },
          // {
          //   attributes: ["id", "startDate", "childrenPrice", "adultPrice"],
          //   association: "tourOnSales",
          // },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listRooms.rows, {
        meta: {
          take: data.take,
          itemCount: listRooms.count,
          page: data.page,
          pageCount: Math.ceil(listRooms.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async findOne(id: number, data: FindOne, user: ModelsAttributes.User, res: Response) {
    try {
      const roomWhereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        stayId: data.stayId,
      };
      let room = await this.roomsModel.findOne({
        where: roomWhereOptions,
        include: [
          {
            association: "languages",
          },
          // {
          //   association: "tourOnSales",
          // },
        ],
      });
      if (!room) {
        return res.onError({
          status: 404,
          detail: "Room not found",
        });
      }

      if (data.language) {
        room = GetLanguage.getLang(room.toJSON(), data.language, roomLangFields);
      }

      return res.onSuccess(room);
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
      const imageUrls = await FileService.uploadAttachments2([...files]);
      if (!imageUrls?.length) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: "Image is required",
        });
      }
      // const imageUrls = images?.map((image) => image?.url);

      const enterpriseId = user.enterpriseId || user.id;

      const stayWhereOptions: WhereOptions = {
        id: data.stayId,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };
      const stay = await this.staysModel.findOne({
        where: stayWhereOptions,
      });
      if (!stay) {
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }
      const prices = [
        data?.mondayPrice,
        data?.tuesdayPrice,
        data?.wednesdayPrice,
        data?.thursdayPrice,
        data?.fridayPrice,
        data?.saturdayPrice,
        data?.sundayPrice,
      ];
      stay.minPrice = Math.min(...prices);
      stay.maxPrice = Math.max(...prices);
      await stay.save();

      const newRoom = await this.roomsModel.create(
        {
          title: data?.title,
          description: data?.description,
          utility: data?.utility,
          images: imageUrls,
          numberOfAdult: data?.numberOfAdult,
          numberOfChildren: data?.numberOfChildren,
          numberOfBed: data?.numberOfBed,
          numberOfRoom: data?.numberOfRoom,
          discount: data?.discount,
          mondayPrice: data?.mondayPrice,
          tuesdayPrice: data?.tuesdayPrice,
          wednesdayPrice: data?.wednesdayPrice,
          thursdayPrice: data?.thursdayPrice,
          fridayPrice: data?.fridayPrice,
          saturdayPrice: data?.saturdayPrice,
          sundayPrice: data?.sundayPrice,
          stayId: data?.stayId,
          isDeleted: false,
        },
        {
          transaction: t,
        }
      );
      await t.commit();
      return res.onSuccess(newRoom, {
        message: res.locals.t("room_create_success"),
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
      if (data.imagesDeleted) {
        await FileService.deleteFiles2(data.imagesDeleted);
      }
      const imageUrls = await FileService.uploadAttachments2([...files]);
      // const imageUrls = images?.map((image) => image?.url);
      const newImageUrls = (data.images || []).concat(imageUrls);

      const room = await this.roomsModel.findOne({
        where: {
          id: id,
        },
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Room not found",
        });
      }

      // ***** Start update min and max price of stay *****
      const enterpriseId = user.enterpriseId || user.id;

      const stayWhereOptions: WhereOptions = {
        id: room.stayId,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };
      const stay = await this.staysModel.findOne({
        where: stayWhereOptions,
      });
      if (!stay) {
        return res.onError({
          status: 404,
          detail: "Stay not found",
        });
      }
      const prices = [
        data?.mondayPrice,
        data?.tuesdayPrice,
        data?.wednesdayPrice,
        data?.thursdayPrice,
        data?.fridayPrice,
        data?.saturdayPrice,
        data?.sundayPrice,
      ];
      stay.minPrice = Math.min(...prices);
      stay.maxPrice = Math.max(...prices);
      await stay.save();

      // ***** End update min and max price of stay *****

      await this.roomsModel.update(
        {
          images: newImageUrls,
          numberOfAdult: data?.numberOfAdult,
          numberOfChildren: data?.numberOfChildren,
          numberOfBed: data?.numberOfBed,
          numberOfRoom: data?.numberOfRoom,
          discount: data?.discount,
          mondayPrice: data?.mondayPrice,
          tuesdayPrice: data?.tuesdayPrice,
          wednesdayPrice: data?.wednesdayPrice,
          thursdayPrice: data?.thursdayPrice,
          fridayPrice: data?.fridayPrice,
          saturdayPrice: data?.saturdayPrice,
          sundayPrice: data?.sundayPrice,
        },
        {
          where: {
            parentLanguage: id,
          },
          transaction: t,
        }
      );

      if (data.language) {
        room.images = newImageUrls;
        room.numberOfAdult = data?.numberOfAdult;
        room.numberOfChildren = data?.numberOfChildren;
        room.numberOfBed = data?.numberOfBed;
        room.numberOfRoom = data?.numberOfRoom;
        room.discount = data?.discount;
        room.mondayPrice = data?.mondayPrice;
        room.tuesdayPrice = data?.tuesdayPrice;
        room.wednesdayPrice = data?.wednesdayPrice;
        room.thursdayPrice = data?.thursdayPrice;
        room.fridayPrice = data?.fridayPrice;
        room.saturdayPrice = data?.saturdayPrice;
        room.sundayPrice = data?.sundayPrice;
        await room.save({ transaction: t });

        const roomLang = await this.roomsModel.findOne({
          where: {
            parentLanguage: id,
            language: data.language,
          },
        });
        if (!roomLang) {
          const roomNew = await this.roomsModel.create(
            {
              title: data?.title,
              description: data?.description,
              utility: data?.utility,
              images: newImageUrls,
              numberOfAdult: data?.numberOfAdult,
              numberOfChildren: data?.numberOfChildren,
              numberOfBed: data?.numberOfBed,
              numberOfRoom: data?.numberOfRoom,
              discount: data?.discount,
              mondayPrice: data?.mondayPrice,
              tuesdayPrice: data?.tuesdayPrice,
              wednesdayPrice: data?.wednesdayPrice,
              thursdayPrice: data?.thursdayPrice,
              fridayPrice: data?.fridayPrice,
              saturdayPrice: data?.saturdayPrice,
              sundayPrice: data?.sundayPrice,
              stayId: room.stayId,
              isDeleted: false,
              parentLanguage: id,
              language: data.language,
            },
            { transaction: t }
          );
          await t.commit();
          return res.onSuccess(roomNew, {
            message: res.locals.t("common_update_success"),
          });
        } else {
          roomLang.title = data?.title;
          roomLang.description = data?.description;
          roomLang.utility = data?.utility;
          await roomLang.save({ transaction: t });
          await t.commit();
          return res.onSuccess(roomLang, {
            message: res.locals.t("common_update_success"),
          });
        }
      }
      room.title = data?.title;
      room.description = data?.description;
      room.utility = data?.utility;
      room.images = newImageUrls;
      room.numberOfAdult = data?.numberOfAdult;
      room.numberOfChildren = data?.numberOfChildren;
      room.numberOfBed = data?.numberOfBed;
      room.numberOfRoom = data?.numberOfRoom;
      room.discount = data?.discount;
      room.mondayPrice = data?.mondayPrice;
      room.tuesdayPrice = data?.tuesdayPrice;
      room.wednesdayPrice = data?.wednesdayPrice;
      room.thursdayPrice = data?.thursdayPrice;
      room.fridayPrice = data?.fridayPrice;
      room.saturdayPrice = data?.saturdayPrice;
      room.sundayPrice = data?.sundayPrice;
      await room.save({ transaction: t });
      await t.commit();
      return res.onSuccess(room, {
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

  public async delete(id: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const enterpriseId = user.enterpriseId || user.id;
      const whereOptions: WhereOptions = {
        id: id,
        parentLanguage: null,
        isDeleted: false,
        owner: enterpriseId,
      };

      const room = await this.roomsModel.findOne({
        where: whereOptions,
      });
      if (!room) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Room not found",
        });
      }
      room.isDeleted = true;
      await this.roomsModel.update(
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
      await room.save({ transaction: t });
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
  
  public async createOrUpdateCheckRoom(data: CreateOrUpdateCheckRoom, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const room = await this.roomsModel.findOne({
        where: {
          id: data.roomId
        }
      })
      if (!room) {
        return res.onError({
          status: 404,
          detail: "Room not found",
        });
      }
      if (room.numberOfRoom < data.amount) {
        return res.onError({
          status: 409,
          detail: "The number of rooms must not be greater than the original number of rooms",
        });
      }
      const date = new Date(data.date)
      const checkRoom = await this.checkRoomsModel.findOne({
        where: {
          stayId: data.stayId,
          roomId: data.roomId,
          bookedDate: date
        }
      })
      if(checkRoom) {
        checkRoom.numberOfRoomsAvailable = data.amount
        await checkRoom.save({ transaction: t });
      } else {
        await this.checkRoomsModel.create({
          stayId: data.stayId,
          roomId: data.roomId,
          bookedDate: data.date,
          numberOfRoomsAvailable: data.amount
          },
          { transaction: t }
        )
      }
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
