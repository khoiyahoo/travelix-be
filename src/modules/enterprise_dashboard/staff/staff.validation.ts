import * as yup from "yup";
import { Request } from "express";
import { ETypeUser, LANG } from "common/general";

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
  
  static sendOffer(req: Request) {
    const schema = yup
      .object({
        email: yup.string().email().required(),
      })
      .noUnknown();
    return schema.validateSync(req.body);
  }
  
  static statisticTourBill(req: Request) {
    const schema = yup
      .object({
        take: yup.number().min(1).integer().default(10),
        page: yup.number().min(1).integer().default(1),
        month: yup.number().integer(),
        year: yup.number().integer(),
        sort: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
  
  static statisticRoomBill(req: Request) {
    const schema = yup
      .object({
        take: yup.number().min(1).integer().default(10),
        page: yup.number().min(1).integer().default(1),
        month: yup.number().integer(),
        year: yup.number().integer(),
        sort: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
