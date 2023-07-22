import Container from "typedi";
import { Request, Response } from "express";
import Service from "./user.service";
import Validation from "./user.validation";

export default class UserController {
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
  
  static changeRole(req: Request, res: Response) {
    try {
      const value = Validation.changeRole(req);
      const ServiceI = Container.get(Service);
      ServiceI.changeRole(value, res);
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
