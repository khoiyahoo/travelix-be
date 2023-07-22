import Container from "typedi";
import Service from "./policy.service";
import Validation from "./policy.validation";
import { Request, Response } from "express";

export default class Controller {
  static findAll(req: Request, res: Response) {
    try {
      const value = Validation.findAll(req)
      const ServiceI = Container.get(Service);
      ServiceI.findAll(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createOrUpdate(req: Request, res: Response) {
    try {
      const value = Validation.createOrUpdate(req)
      const ServiceI = Container.get(Service);
      ServiceI.createOrUpdate(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const ServiceI = Container.get(Service);
      ServiceI.delete(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
