import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        language: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.query);
  }

  static createOne(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        day: yup.number(),
        startTime: yup.number(),
        endTime: yup.number(),
        description: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static createMultiple(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        day: yup.number(),
        schedule: yup.array(
          yup.object({
            id: yup.number(),
            startTime: yup.number(),
            endTime: yup.number(),
            description: yup.string(),
            language: yup.string(),
          })
        ),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static createOrUpdate(req: Request) {
    const schema = yup
      .object({
        tourId: yup.number(),
        day: yup.number(),
        language: yup.string(),
        schedule: yup.array(
          yup.object({
            id: yup.number(),
            startTime: yup.number(),
            endTime: yup.number(),
            description: yup.string(),
            language: yup.string(),
          })
        ),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        startTime: yup.number(),
        endTime: yup.number(),
        description: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
