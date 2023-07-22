import Container from "typedi";
import { Request, Response } from "express";
import Service from "./staff.service";
import Validation from "./staff.validation";

export default class StaffController {
  static findAll(req: Request, res: Response) {
    try {
      const value = Validation.findAll(req);
      const ServiceI = Container.get(Service);
      ServiceI.findAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static sendOffer(req: Request, res: Response) {
    try {
      const value = Validation.sendOffer(req);
      const ServiceI = Container.get(Service);
      ServiceI.sendOffer(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static cancelSendOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.cancelSendOffer(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static acceptOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.acceptOffer(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAllOffers(req: Request, res: Response) {
    try {
      const value = Validation.findAll(req);
      const ServiceI = Container.get(Service);
      ServiceI.findAllOffers(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.delete(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static statisticTourBill(req: Request, res: Response) {
    try {
      const value = Validation.statisticTourBill(req);
      const ServiceI = Container.get(Service);
      ServiceI.statisticTourBill(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static statisticRoomBill(req: Request, res: Response) {
    try {
      const value = Validation.statisticRoomBill(req);
      const ServiceI = Container.get(Service);
      ServiceI.statisticRoomBill(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
