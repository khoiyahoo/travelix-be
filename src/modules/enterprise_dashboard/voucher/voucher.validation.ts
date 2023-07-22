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

  static create(req: Request) {
    const schema = yup
      .object({
        startTime: yup.date(),
        endTime: yup.date(),
        hotelIds: yup.array(yup.number()),
        tourIds: yup.array(yup.number()),
        numberOfCodes: yup.number(),
        discountType: yup.number(),
        discountValue: yup.number(),
        minOrder: yup.number(),
        maxDiscount: yup.number(),
        isQuantityLimit: yup.boolean(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        startTime: yup.date(),
        endTime: yup.date(),
        hotelIds: yup.array(yup.number()),
        tourIds: yup.array(yup.number()),
        numberOfCodes: yup.number(),
        discountType: yup.number(),
        discountValue: yup.number(),
        minOrder: yup.number(),
        maxDiscount: yup.number(),
        isQuantityLimit: yup.boolean(),
        language: yup.string().oneOf([LANG.VI, LANG.EN]).notRequired(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
