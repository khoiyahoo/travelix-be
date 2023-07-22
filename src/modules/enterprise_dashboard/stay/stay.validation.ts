import * as yup from "yup";
import { Request } from "express";
import { LANG } from "common/general";
import { StayType } from "models/general";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        status: yup.number().integer(),
        type: yup.number().integer(),
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

  static create(req: Request) {
    const schema = yup
      .object({
        name: yup.string(),
        type: yup.number().integer().oneOf([StayType.HOTEL, StayType.HOMESTAY, StayType.RESORT]).notRequired(),
        checkInTime: yup.number(),
        checkOutTime: yup.number(),
        city: yup.object({
          id: yup.number(),
          name: yup.string(),
        }),
        district: yup.object({
          id: yup.number(),
          name: yup.string(),
        }),
        commune: yup.object({
          id: yup.number(),
          name: yup.string(),
        }),
        moreLocation: yup.string(),
        contact: yup.string(),
        description: yup.string(),
        convenient: yup.array(yup.string()),
        highlight: yup.string(),
        termsAndCondition: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        name: yup.string(),
        type: yup.number().integer().oneOf([StayType.HOTEL, StayType.HOMESTAY, StayType.RESORT]).notRequired(),
        checkInTime: yup.number(),
        checkOutTime: yup.number(),
        city: yup.object({
          id: yup.number(),
          name: yup.string(),
        }),
        district: yup.object({
          id: yup.number(),
          name: yup.string(),
        }),
        commune: yup.object({
          id: yup.number(),
          name: yup.string(),
        }),
        moreLocation: yup.string(),
        contact: yup.string(),
        description: yup.string(),
        convenient: yup.array(yup.string()),
        highlight: yup.string(),
        termsAndCondition: yup.string(),
        language: yup.string().oneOf([LANG.VI, LANG.EN]).notRequired(),
        images: yup.array(yup.string()),
        imagesDeleted: yup.array(yup.string()),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
