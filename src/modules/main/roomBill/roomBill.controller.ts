import Container from "typedi";
import RoomBillService from "./roomBill.service";
import Validation from "./roomBill.validation";
import { Request, Response } from "express";

export default class Controller {
  static create(req: Request, res: Response) {
    try {
      const value = Validation.create(req);
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.create(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static reSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.reSchedule(req);
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.reSchedule(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.update(req);
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.update(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAll(req: Request, res: Response) {
    try {
      const value = Validation.findAll(req);
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.findAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.findOne(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findLatest(req: Request, res: Response) {
    try {
      const { stayId } = req.params;
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.findLatest(Number(stayId), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.cancel(req);
      const RoomBillServiceI = Container.get(RoomBillService);
      RoomBillServiceI.cancel(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
