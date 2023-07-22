import * as yup from "yup";
import { Request } from "express";
import { LANG } from "common/general";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static findOne(req: Request) {
    const schema = yup
      .object({
        language: yup.string().oneOf([LANG.VI, LANG.EN]).notRequired(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
