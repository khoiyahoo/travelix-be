import Container from "typedi";
import Service from "./roomBill.service";
import Validation from "./roomBill.validation";
import { Request, Response } from "express";

export default class Controller {
  static statisticAllUsers(req: Request, res: Response) {
    try {
      const value = Validation.statisticAllUsers(req);
      const ServiceI = Container.get(Service);
      ServiceI.statisticAllUsers(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getFiltersForStayOfUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.getFiltersForStayOfUser(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticOneUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.statisticOneUser(req);
      const ServiceI = Container.get(Service);
      ServiceI.statisticOneUser(Number(id), value, res);
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
      ServiceI.statisticOneStay(Number(id), value, res);
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
      ServiceI.statisticOneRoom(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAllOrderNeedRefund(req: Request, res: Response) {
    try {
      const value = Validation.findAllOrderNeedRefund(req);
      const ServiceI = Container.get(Service);
      ServiceI.findAllOrderNeedRefund(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateRefunded(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.updateRefunded(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static generateQuarterlyRevenue(req: Request, res: Response) {
    try {
      const ServiceI = Container.get(Service);
      ServiceI.generateQuarterlyRevenue(res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAllStayRevenue(req: Request, res: Response) {
    try {
      const value = Validation.findAllStayRevenue(req);
      const ServiceI = Container.get(Service);
      ServiceI.findAllStayRevenue(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateSendRevenue(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.updateSendRevenue(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
