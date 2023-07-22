import Container from "typedi";
import RoomOtherPriceService from "./roomOtherPrice.service";
import Validation from "./roomOtherPrice.validation";
import { Request, Response } from "express";

export default class Controller {
  static findAll(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.findAll(req);
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.findAll(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createOrUpdate(req: Request, res: Response) {
    try {
      const value = Validation.createOrUpdate(req);
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.createOrUpdate(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const RoomOtherPriceServiceI = Container.get(RoomOtherPriceService);
      RoomOtherPriceServiceI.delete(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
