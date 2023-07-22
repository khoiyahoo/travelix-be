import Container from "typedi";
import TourBillService from "./tourBill.service";
import TourBillValidation from "./tourBill.validation";
import { Request, Response } from "express";

export default class UserController {
  static statisticByUser(req: Request, res: Response) {
    try {
      const value = TourBillValidation.statisticByUser(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.statisticByUser(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticByTour(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.statisticByTour(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.statisticByTour(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticByTourOnSale(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.statisticByTourOnSale(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.statisticByTourOnSale(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllBillOfOneTourOnSale(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.getAllBillOfOneTourOnSale(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.getAllBillOfOneTourOnSale(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAllOrderNeedRefund(req: Request, res: Response) {
    try {
      const value = TourBillValidation.findAllOrderNeedRefund(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findAllOrderNeedRefund(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateRefunded(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.updateRefunded(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticAllTourOnSale(req: Request, res: Response) {
    try {
      const value = TourBillValidation.statisticAllTourOnSale(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.statisticAllTourOnSale(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
