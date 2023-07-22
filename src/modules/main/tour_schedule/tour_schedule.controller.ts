import Container from "typedi";
import Service from "./tour_schedule.service";
import Validation from "./tour_schedule.validation";
import { Request, Response } from "express";

export default class Controller {
  static findAll(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.findAll(Number(tourId), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
