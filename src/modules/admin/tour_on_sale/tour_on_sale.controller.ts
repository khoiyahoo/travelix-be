import Container from "typedi";
import Service from "./tour_on_sale.service";
import { Request, Response } from "express";

export default class Controller {
  static updateReceivedRevenue(req: Request, res: Response) {
    try {
      const { id } = req.params
      const ServiceI = Container.get(Service);
      ServiceI.updateReceivedRevenue(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
