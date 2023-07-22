import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        serviceType: yup.number().integer().notRequired(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
