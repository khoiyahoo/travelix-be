import * as yup from "yup";
import { Request } from "express";

export default class TourValidation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().min(1).integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
        sort: yup.number().integer(),
        dateSearch: yup.date(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  // static createNewTour(req: Request) {
  //   const schema = yup
  //     .object({
  //       title: yup.string(),
  //       description: yup.string(),
  //       businessHours: yup.string(),
  //       location: yup.string(),
  //       contact: yup.string(),
  //       price: yup.number(),
  //       discount: yup.number(),
  //       tags: yup.string().nullable(),
  //       images: yup.string().nullable(),
  //       creator: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }

  // static updateTour(req: Request) {
  //   const schema = yup
  //     .object({
  //       title: yup.string(),
  //       description: yup.string(),
  //       businessHours: yup.string(),
  //       location: yup.string(),
  //       contact: yup.string(),
  //       price: yup.number(),
  //       discount: yup.number(),
  //       tags: yup.string().nullable(),
  //       images: yup.string().nullable(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
}
