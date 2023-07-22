import Container from "typedi";
import TourBillService from "./tourBill.service";
import TourBillValidation from "./tourBill.validation";
import { Request, Response } from "express";

export default class UserController {
  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.update(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.update(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getFilters(req: Request, res: Response) {
    try {
      const value = TourBillValidation.getFilters(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.getFilters(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAll(req: Request, res: Response) {
    try {
      const value = TourBillValidation.findAll(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findOne(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticAll(req: Request, res: Response) {
    try {
      const value = TourBillValidation.statisticAll(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.statisticAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static statisticOneTour(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.statisticOneTour(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.statisticOneTour(Number(id), value, req.user, res);
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
      TourBillServiceI.getAllBillOfOneTourOnSale(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static findAllStaffBill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.findAllStaffBill(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findAllStaffBill(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
