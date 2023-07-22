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

  static create(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        discount: yup.number(),
        quantity: yup.number(),
        startDate: yup.date(),
        childrenAgeMin: yup.number(),
        childrenAgeMax: yup.number(),
        childrenPrice: yup.number(),
        adultPrice: yup.number(),
        currency: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        discount: yup.number(),
        quantity: yup.number(),
        startDate: yup.date(),
        childrenAgeMin: yup.number(),
        childrenAgeMax: yup.number(),
        childrenPrice: yup.number(),
        adultPrice: yup.number(),
        currency: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static createOrUpdate(req: Request) {
    const schema = yup.array(
      yup
        .object({
          id: yup.number(),
          tourId: yup.number(),
          discount: yup.number(),
          quantity: yup.number(),
          startDate: yup.date(),
          childrenAgeMin: yup.number(),
          childrenAgeMax: yup.number(),
          childrenPrice: yup.number(),
          adultPrice: yup.number(),
          currency: yup.string(),
        })
        .noUnknown()
        .required()
    );
    return schema.validateSync(req.body);
  }
}
