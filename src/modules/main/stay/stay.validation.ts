import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().min(1).integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        numberOfAdult: yup.number().integer().nullable(),
        numberOfChildren: yup.number().integer().nullable(),
        startDate: yup.date().nullable(),
        endDate: yup.date().nullable(),
        numberOfRoom: yup.number().integer().nullable(),
        sort: yup.number().integer().nullable(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
