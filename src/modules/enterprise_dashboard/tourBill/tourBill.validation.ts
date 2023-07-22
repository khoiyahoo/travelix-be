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

  static getFilters(req: Request) {
    const schema = yup
      .object({
        isPast: yup.boolean().default(false),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        tourId: yup.number(),
        tourOnSaleIds: yup.array(yup.number()),
        status: yup.number(),
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

  static statisticOneTour(req: Request) {
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

  static getAllBillOfOneTourOnSale(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
  
  static findAllStaffBill(req: Request) {
    const schema = yup
      .object({
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        tourId: yup.number().default(-1),
        status: yup.number().default(-1),
        month: yup.number().integer(),
        year: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }
}
