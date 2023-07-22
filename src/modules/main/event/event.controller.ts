import Container from "typedi";
import Service from "./event.service";
import Validation from "./event.validation";
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
      const value = Validation.findOne(req);
      const ServiceI = Container.get(Service);
      ServiceI.findOne(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const ServiceI = Container.get(Service);
      ServiceI.findByCode(code, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
