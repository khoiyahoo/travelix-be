import * as yup from "yup";
import { Request } from "express";

export default class TourBillValidation {
  static update(req: Request) {
    const schema = yup
      .object({
        status: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        stayId: yup.number(),
        status: yup.number(),
        roomId: yup.number().nullable(),
        date: yup.date().nullable(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static statisticAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static statisticOneStay(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static statisticOneRoom(req: Request) {
    const schema = yup
      .object({
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static findAllStaffBill(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        stayId: yup.number(),
        status: yup.number().default(-1),
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
