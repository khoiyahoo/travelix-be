import Container from "typedi";
import Service from "./room.service";
import Validation from "./room.validation";
import { Request, Response } from "express";

export default class Controller {
  static findAll(req: Request, res: Response) {
    try {
      const value = Validation.findAll(req);
      const ServiceI = Container.get(Service);
      ServiceI.findAll(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  // static getRoom(req: Request, res: Response) {
  //   try {
  //     const { roomId } = req.params;
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.getRoom(Number(roomId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getRoomsAvailable(req: Request, res: Response) {
  //   try {
  //     const value = RoomValidation.getRoomsAvailable(req);
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.getRoomsAvailable(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getAllRoomsOfHotel(req: Request, res: Response) {
  //   try {
  //     const { hotelId } = req.params;
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.getAllRoomsOfHotel(Number(hotelId) ,res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static createNewRoom(req: Request, res: Response) {
  //   try {
  //     const value = RoomValidation.createNewRoom(req);
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.createNewRoom(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static updateRoomInformation(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const value = RoomValidation.updateRoomInformation(req);
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.updateRoomInformation(Number(id), value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static updateRoomPrice(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const value = RoomValidation.updateRoomPrice(req);
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.updateRoomPrice(Number(id), value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static temporarilyStopWorking(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.temporarilyStopWorking(Number(id), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
  
  // static workAgain(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.workAgain(Number(id), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static deleteRoom(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const RoomServiceI = Container.get(RoomService);
  //     RoomServiceI.deleteRoom(Number(id), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
}
