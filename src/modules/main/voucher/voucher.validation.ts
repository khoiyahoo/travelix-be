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
        serviceType: yup.number().integer().required(),
        serviceId: yup.number().integer().required(),
        owner: yup.number().integer().required(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
