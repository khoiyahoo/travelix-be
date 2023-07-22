import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static create(req: Request) {
    const schema = yup
      .object({
        tourOnSaleId: yup.number(),
        title: yup.number(),
        minOld: yup.date(),
        maxOld: yup.date(),
        price: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        title: yup.number(),
        minOld: yup.date(),
        maxOld: yup.date(),
        price: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
