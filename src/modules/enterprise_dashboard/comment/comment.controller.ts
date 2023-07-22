import Container from "typedi";
import { Request, Response } from "express";
import Service from "./comment.service";
import Validation from "./comment.validation";

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
}
