import Container from "typedi";
import Service from "./voucher.service";
import Validation from "./voucher.validation";
import { Request, Response } from "express";

export default class Controller {
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
}
