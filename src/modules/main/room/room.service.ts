/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { FindAll } from "./room.models";
import { Response } from "express";
import { Op, Sequelize, WhereOptions } from "sequelize";
import GetLanguage from "services/getLanguage";
import { roomLangFields } from "models/langField";
import moment from "moment";

@Service()
export default class RoomService {
  constructor(
    @Inject("roomsModel") private roomsModel: ModelsInstance.Rooms,
    @Inject("checkRoomsModel") private checkRoomsModel: ModelsInstance.CheckRooms,
    @Inject("roomOtherPricesModel") private roomOtherPricesModel: ModelsInstance.RoomOtherPrices
  ) {}
  public async findAll(data: FindAll, res: Response) {
    try {
      const lang = res.locals.language;

      // Take the unsatisfactory rooms
      const unsatisfactoryRooms = await this.checkRoomsModel.findAll({
        attributes: [
          "id",
          "bookedDate",
          "roomId",
          [Sequelize.fn("min", Sequelize.col("numberOfRoomsAvailable")), "numberOfRoomsAvailable"],
        ],
        where: {
          stayId: data.stayId,
          bookedDate: {
            [Op.between]: [data?.startDate, data?.endDate],
          },
          numberOfRoomsAvailable: {
            [Op.lt]: data.numberOfRoom,
          },
        },
        group: "roomId",
      });
      const unsatisfactoryRoomIds = unsatisfactoryRooms.map((item) => item.roomId);

      // Query rooms
      const offset = data.take * (data.page - 1);
      let whereOptions: WhereOptions = {
        stayId: data.stayId,
        parentLanguage: null,
        isDeleted: false,
        id: {
          [Op.notIn]: unsatisfactoryRoomIds,
        },
      };
      if (data?.numberOfAdult) {
        whereOptions = {
          ...whereOptions,
          numberOfAdult: data.numberOfAdult,
        };
      }
      if (data?.numberOfChildren) {
        whereOptions = {
          ...whereOptions,
          numberOfChildren: data.numberOfChildren,
        };
      }
      if (data?.numberOfRoom) {
        whereOptions = {
          ...whereOptions,
          numberOfRoom: {
            [Op.gte]: data.numberOfRoom,
          },
        };
      }
      const listRooms = await this.roomsModel.findAndCountAll({
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
      if (!listRooms) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }

      const otherPrices = await this.roomOtherPricesModel.findAll({
        where: {
          date: {
            [Op.between]: [data?.startDate, data?.endDate],
          },
        },
      })

      // take the satisfying rooms
      const listRoomIds = listRooms.rows.map((item) => item.id);
      const satisfyingRooms = await this.checkRoomsModel.findAll({
        attributes: [
          "id",
          "bookedDate",
          "roomId",
          [Sequelize.fn("min", Sequelize.col("numberOfRoomsAvailable")), "numberOfRoomsAvailable"],
        ],
        where: {
          roomId: listRoomIds,
          bookedDate: {
            [Op.between]: [data?.startDate, data?.endDate],
          },
          numberOfRoomsAvailable: {
            [Op.gte]: data.numberOfRoom,
          },
        },
        group: "roomId",
      });

      let result = GetLanguage.getLangListModel<ModelsAttributes.Room>(listRooms.rows, lang, roomLangFields);
      const satisfyingRoomIds = satisfyingRooms.map((item) => item.roomId);

      result = result.map((room) => {
        let _room = {
          ...room,
          prices: this.getRoomPrices(room, data.startDate, data.endDate, otherPrices || []),
        };
        if (satisfyingRoomIds.includes(room.id)) {
          const satisfyingRoom = satisfyingRooms.find((item) => item.roomId === room.id);
          _room = {
            ..._room,
            numberOfRoom: satisfyingRoom.numberOfRoomsAvailable,
          };
        }
        return { ..._room };
      }) as any;

      return res.onSuccess(result, {
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

  /**
   * Get room
   */
  // public async getRoom(roomId: number, res: Response) {
  //   try {
  //     const room = await this.roomsModel.findOne({
  //       where: {
  //         id: roomId,
  //       },
  //     });
  //     if (!room) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }
  //     const result = {
  //       ...room?.dataValues,
  //       tags: room?.tags.split(","),
  //       images: room?.images.split(","),
  //     };
  //     return res.onSuccess(result, {
  //       message: res.locals.t("get_room_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  /**
   * Get rooms available
   */
  getPriceOfDate = (date: Date, room: ModelsAttributes.Room) => {
    let price = 0;
    const currentDay = date.getDay();
    switch (currentDay) {
      case 0:
        price = room.sundayPrice;
        break;
      case 1:
        price = room.mondayPrice;
        break;
      case 2:
        price = room.tuesdayPrice;
        break;
      case 3:
        price = room.wednesdayPrice;
        break;
      case 4:
        price = room.thursdayPrice;
        break;
      case 5:
        price = room.fridayPrice;
        break;
      case 6:
        price = room.saturdayPrice;
    }
    return price;
  };
  getRoomPrices = (room: ModelsAttributes.Room, startDate: Date, endDate: Date, otherPrices: ModelsAttributes.RoomOtherPrice[]) => {
    const prices = [];
    const _date = new Date(startDate);
    const _endDate = new Date(endDate);
    while (_date < _endDate) {
      let priceItem = {
        date: new Date(_date),
        price: 0,
      };
      const _otherPrice = otherPrices.find((item) => moment(_date).format("DD/MM/YYYY") === moment(item.date).format("DD/MM/YYYY"));
      if (_otherPrice) {
        priceItem = {
          ...priceItem,
          price: _otherPrice.price,
        };
      } else {
        priceItem = {
          ...priceItem,
          price: this.getPriceOfDate(_date, room),
        };
      }
      prices.push(priceItem);
      _date.setDate(_date.getDate() + 1);
    }
    return prices;
  };
  // public async getRoomsAvailable(data: IGetRoomsAvailable, res: Response) {
  //   try {
  //     const listRooms = await this.roomsModel.findAll({
  //       where: {
  //         hotelId: data.hotelId,
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!listRooms) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }

  //     const rooms = await listRooms.map(async (item: any) => {
  //       const listCheckRooms = await this.checkRoomsModel.findAll({
  //         where: {
  //           roomId: item?.dataValues?.id,
  //         },
  //       });
  //       const startDate = new Date(data.startDate);
  //       const dateOfStartDate = startDate.getDate()
  //       const monthOfStartDate = startDate.getMonth()
  //       const yearOfStartDate = startDate.getFullYear()
  //       const endDate = new Date(data.endDate);
  //       const dateOfEndDate = endDate.getDate()
  //       const monthOfEndDate = endDate.getMonth()
  //       const yearOfEndDate = endDate.getFullYear()
  //       const _startDate=new Date(yearOfStartDate, monthOfStartDate, dateOfStartDate)
  //       const _endDate=new Date(yearOfEndDate, monthOfEndDate, dateOfEndDate)
  //       let numberOfRooms = item?.dataValues?.numberOfRoom;
  //       if (listCheckRooms) {
  //         listCheckRooms.map((check) => {
  //           const bookedDate = check.dataValues?.bookedDate.split(",")
  //           const _bookedDate = new Date(bookedDate[0], bookedDate[1], bookedDate[2]);
  //           if (
  //             _startDate.getTime() <= _bookedDate.getTime() &&
  //             _endDate.getTime() > _bookedDate.getTime() &&
  //             check.dataValues?.numberOfRoomsAvailable < numberOfRooms
  //           ) {
  //             numberOfRooms = check.dataValues?.numberOfRoomsAvailable;
  //           }
  //         });
  //       }

  //       const allPrices = await this.roomOtherPricesModel.findAll({
  //         where: {
  //           roomId: item?.dataValues?.id,
  //         },
  //       });
  //       return {
  //         ...item?.dataValues,
  //         numberOfRoom: numberOfRooms,
  //         tags: item?.tags.split(","),
  //         images: item?.images.split(","),
  //         specialDatePrice: allPrices
  //       };
  //     });
  //     Promise.all(rooms)
  //       .then((result) => {
  //         return res.onSuccess(result, {
  //           message: res.locals.t("get_rooms_success"),
  //         });
  //       })
  //       .catch((error) => {
  //         return res.onError({
  //           status: 500,
  //           detail: error,
  //         });
  //       });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  /**
   * Get all rooms
   */
  // public async getAllRoomsOfHotel(hotelId: number, res: Response) {
  //   try {
  //     const listRooms = await this.roomsModel.findAll({
  //       where: {
  //         hotelId: hotelId,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!listRooms) {
  //       return res.onError({
  //         status: 404,
  //         detail: "Not found",
  //       });
  //     }
  //     const rooms = listRooms.map((item) => {
  //       return {
  //         ...item?.dataValues,
  //         tags: item?.tags.split(","),
  //         images: item?.images.split(","),
  //       };
  //     });
  //     return res.onSuccess(rooms, {
  //       message: res.locals.t("get_all_rooms_success"),
  //     });
  //   } catch (error) {
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async createNewRoom(data: ICreateRoom, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const newRoom = await this.roomsModel.create(
  //       {
  //         title: data?.title,
  //         description: data?.description,
  //         discount: data?.discount || 0,
  //         tags: data?.tags || "",
  //         images: data?.images,
  //         hotelId: data?.hotelId,
  //         numberOfBed: data?.numberOfBed,
  //         numberOfRoom: data?.numberOfRoom,
  //         mondayPrice: data?.mondayPrice,
  //         tuesdayPrice: data?.tuesdayPrice,
  //         wednesdayPrice: data?.wednesdayPrice,
  //         thursdayPrice: data?.thursdayPrice,
  //         fridayPrice: data?.fridayPrice,
  //         saturdayPrice: data?.saturdayPrice,
  //         sundayPrice: data?.sundayPrice,
  //         isTemporarilyStopWorking: false,
  //         isDeleted: false,
  //       },
  //       {
  //         transaction: t,
  //       }
  //     );
  //     await t.commit();
  //     return res.onSuccess(
  //       { ...newRoom, images: newRoom.images.split(",") },
  //       {
  //         message: res.locals.t("room_create_success"),
  //       }
  //     );
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async updateRoomInformation(roomId: number, data: IUpdateRoomInfo, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const room = await this.roomsModel.findOne({
  //       where: {
  //         id: roomId,
  //         isDeleted: false,
  //       },
  //     });
  //     if (!room) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("room_not_found"),
  //       });
  //     }
  //     if (data.title) room.title = data.title;
  //     if (data.description) room.description = data.description;
  //     if (data.tags) room.tags = data.tags;
  //     if (data.images) room.images = data.images;
  //     if (data.numberOfBed) room.numberOfBed = data.numberOfBed;
  //     if (data.numberOfRoom) room.numberOfRoom = data.numberOfRoom;

  //     await room.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(room, {
  //       message: res.locals.t("room_information_update_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async updateRoomPrice(roomId: number, data: IUpdateRoomPrice, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const room = await this.roomsModel.findOne({
  //       where: {
  //         id: roomId,
  //       },
  //     });
  //     if (!room) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("room_not_found"),
  //       });
  //     }

  //     if (data.discount) room.discount = data.discount;
  //     if (data.mondayPrice) room.mondayPrice = data.mondayPrice;
  //     if (data.tuesdayPrice) room.tuesdayPrice = data.tuesdayPrice;
  //     if (data.wednesdayPrice) room.wednesdayPrice = data.wednesdayPrice;
  //     if (data.thursdayPrice) room.thursdayPrice = data.thursdayPrice;
  //     if (data.fridayPrice) room.fridayPrice = data.fridayPrice;
  //     if (data.saturdayPrice) room.saturdayPrice = data.saturdayPrice;
  //     if (data.sundayPrice) room.sundayPrice = data.sundayPrice;

  //     await room.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(room, {
  //       message: res.locals.t("room_price_update_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async temporarilyStopWorking(roomId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const room = await this.roomsModel.findOne({
  //       where: {
  //         id: roomId,
  //       },
  //     });
  //     if (!room) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("room_not_found"),
  //       });
  //     }
  //     room.isTemporarilyStopWorking = true;

  //     await room.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(room, {
  //       message: res.locals.t("room_temporarily_stop_working_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async workAgain(roomId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const room = await this.roomsModel.findOne({
  //       where: {
  //         id: roomId,
  //       },
  //     });
  //     if (!room) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("room_not_found"),
  //       });
  //     }
  //     room.isTemporarilyStopWorking = false;

  //     await room.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(room, {
  //       message: res.locals.t("start_working_again_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }

  // public async deleteRoom(roomId: number, res: Response) {
  //   const t = await sequelize.transaction();
  //   try {
  //     const room = await this.roomsModel.findOne({
  //       where: {
  //         id: roomId,
  //       },
  //     });
  //     if (!room) {
  //       await t.rollback();
  //       return res.onError({
  //         status: 404,
  //         detail: res.locals.t("room_not_found"),
  //       });
  //     }
  //     room.isDeleted = true;

  //     await room.save({ transaction: t });
  //     await t.commit();
  //     return res.onSuccess(room, {
  //       message: res.locals.t("room_delete_success"),
  //     });
  //   } catch (error) {
  //     await t.rollback();
  //     return res.onError({
  //       status: 500,
  //       detail: error,
  //     });
  //   }
  // }
}
