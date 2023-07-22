import Container from "typedi";
import Service from "./commission.service";
import Validation from "./commission.validation";
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

  static findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.findOne(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
