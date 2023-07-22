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

  static create(req: Request, res: Response) {
    try {
      const value = Validation.create(req);
      const ServiceI = Container.get(Service);
      ServiceI.create(value, req.files as Express.Multer.File[], req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.update(req);
      const ServiceI = Container.get(Service);
      ServiceI.update(Number(id), value, req.files as Express.Multer.File[], req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static reply(req: Request, res: Response) {
    try {
      const value = Validation.reply(req);
      const ServiceI = Container.get(Service);
      ServiceI.reply(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateReply(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = Validation.updateReply(req);
      const ServiceI = Container.get(Service);
      ServiceI.updateReply(Number(id), value, req.user, res);
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
      ServiceI.delete(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
