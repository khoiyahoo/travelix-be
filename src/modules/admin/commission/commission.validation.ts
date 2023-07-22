import * as yup from "yup";
import { Request } from "express";
import { EServiceType } from "common/general";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        serviceType: yup.number().integer().oneOf([EServiceType.TOUR, EServiceType.HOTEL]).required(),
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static create(req: Request) {
    const schema = yup
      .object({
        serviceType: yup.number().integer().oneOf([EServiceType.TOUR, EServiceType.HOTEL]).required(),
        minPrice: yup.number().required(),
        maxPrice: yup.number().nullable(),
        rate: yup.number().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        minPrice: yup.number().required(),
        maxPrice: yup.number().nullable(),
        rate: yup.number().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
