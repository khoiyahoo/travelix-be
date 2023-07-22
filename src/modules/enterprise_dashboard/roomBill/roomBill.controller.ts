import Container from "typedi";
import Service from "./roomBill.service";
import Validation from "./roomBill.validation";
import { Request, Response } from "express";

export default class Controller {
  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.update(req);
      const ServiceI = Container.get(Service);
      ServiceI.update(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getFilters(req: Request, res: Response) {
    try {
      const ServiceI = Container.get(Service);
      ServiceI.getFilters(req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

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

  static findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.findOne(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticAll(req: Request, res: Response) {
    try {
      const value = Validation.statisticAll(req);
      const ServiceI = Container.get(Service);
      ServiceI.statisticAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticOneStay(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.statisticOneStay(req);
      const ServiceI = Container.get(Service);
      ServiceI.statisticOneStay(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticOneRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.statisticOneRoom(req);
      const ServiceI = Container.get(Service);
      ServiceI.statisticOneRoom(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static findAllStaffBill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.findAllStaffBill(req);
      const ServiceI = Container.get(Service);
      ServiceI.findAllStaffBill(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
