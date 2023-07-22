import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().notRequired(),
        page: yup.number().min(1).integer().notRequired(),
        isPast: yup.boolean().default(false),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static createOrUpdate(req: Request) {
    const schema = yup.array(
      yup
        .object({
          id: yup.number(),
          date: yup.date(),
          price: yup.number(),
          roomId: yup.number(),
        })
        .noUnknown()
        .required()
    );
    return schema.validateSync(req.body);
  }
}
