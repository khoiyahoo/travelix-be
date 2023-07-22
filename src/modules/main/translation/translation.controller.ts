import Container from "typedi";
import Service from "./translation.service";
import { NextFunction, Request, Response } from 'express';
import i18next from 'i18next'

export default class LocaleController {
  static findAll(req: Request, res: Response) {
    try {
      const { lng, ns } = req.params
      const ServiceI = Container.get(Service)
      ServiceI.findAll(lng, ns, res);
    } catch (error) {
      return res.onError({
        detail: error
      });
    }
  }

  static async getLocale(req: Request, res: Response, next: NextFunction) {
    const ServiceI = Container.get(Service)
    const data = await ServiceI.getLocale(req, res);
    Object.keys(data).forEach(lang => {
      i18next.addResourceBundle(lang, 'common', data[lang])
    })
    next()
  }

  static async syncFromDB(req: Request, res: Response) {
    try {
      const ServiceI = Container.get(Service)
      ServiceI.syncFromDB(res);
    } catch (error) {
      return res.onError({
        detail: error
      });
    }
  }
}