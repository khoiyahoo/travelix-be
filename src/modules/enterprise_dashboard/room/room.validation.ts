import * as yup from "yup";
import { Request } from "express";
import { LANG } from "common/general";
import { StayType } from "models/general";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        stayId: yup.number(),
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
        stayId: yup.number(),
        language: yup.string().oneOf([LANG.VI, LANG.EN]).notRequired(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static create(req: Request) {
    const schema = yup
      .object({
        title: yup.string(),
        description: yup.string(),
        utility: yup.array(yup.string()),
        discount: yup.number(),
        numberOfAdult: yup.number(),
        numberOfChildren: yup.number(),
        numberOfBed: yup.number(),
        numberOfRoom: yup.number(),
        mondayPrice: yup.number(),
        tuesdayPrice: yup.number(),
        wednesdayPrice: yup.number(),
        thursdayPrice: yup.number(),
        fridayPrice: yup.number(),
        saturdayPrice: yup.number(),
        sundayPrice: yup.number(),
        stayId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        title: yup.string(),
        description: yup.string(),
        utility: yup.array(yup.string()),
        discount: yup.number(),
        numberOfAdult: yup.number(),
        numberOfChildren: yup.number(),
        numberOfBed: yup.number(),
        numberOfRoom: yup.number(),
        mondayPrice: yup.number(),
        tuesdayPrice: yup.number(),
        wednesdayPrice: yup.number(),
        thursdayPrice: yup.number(),
        fridayPrice: yup.number(),
        saturdayPrice: yup.number(),
        sundayPrice: yup.number(),
        stayId: yup.number(),
        language: yup.string().oneOf([LANG.VI, LANG.EN]).notRequired(),
        images: yup.array(yup.string()),
        imagesDeleted: yup.array(yup.string()),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static createOrUpdateCheckRoom(req: Request) {
    const schema = yup
      .object({
        date: yup.date(),
        amount: yup.number(),
        stayId: yup.number(),
        roomId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
