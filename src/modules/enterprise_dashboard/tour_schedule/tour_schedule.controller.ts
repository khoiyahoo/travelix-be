import Container from "typedi";
import Service from "./tour_schedule.service";
import Validation from "./tour_schedule.validation";
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

  static createOne(req: Request, res: Response) {
    try {
      const value = Validation.createOne(req);
      const ServiceI = Container.get(Service);
      ServiceI.createOne(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createMultiple(req: Request, res: Response) {
    try {
      const value = Validation.createMultiple(req);
      const ServiceI = Container.get(Service);
      ServiceI.createMultiple(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createOrUpdate(req: Request, res: Response) {
    try {
      const value = Validation.createOrUpdate(req);
      const ServiceI = Container.get(Service);
      ServiceI.createOrUpdate(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  // static update(req: Request, res: Response) {
  //   try {
  //     const { id } = req.params;
  //     const value = Validation.update(req);
  //     const ServiceI = Container.get(Service);
  //     ServiceI.update(Number(id), value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  static delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.delete(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static deleteMultiple(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const { day } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.deleteMultiple(Number(tourId), Number(day), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
