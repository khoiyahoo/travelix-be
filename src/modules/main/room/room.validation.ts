import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        take: yup.number().min(1).integer().default(10),
        page: yup.number().min(1).integer().default(1),
        stayId: yup.number().integer().required(),
        numberOfAdult: yup.number().integer(),
        numberOfChildren: yup.number().integer(),
        startDate: yup.date().required(),
        endDate: yup.date().required(),
        numberOfRoom: yup.number().integer(),
        sort: yup.number().integer(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  // static createNewRoom(req: Request) {
  //   const schema = yup
  //     .object({
  //       title: yup.string(),
  //       description: yup.string(),
  //       discount: yup.number(),
  //       tags: yup.string().nullable(),
  //       images: yup.string().nullable(),
  //       hotelId: yup.number(),
  //       numberOfBed: yup.number(),
  //       numberOfRoom: yup.number(),
  //       mondayPrice: yup.number(),
  //       tuesdayPrice: yup.number(),
  //       wednesdayPrice: yup.number(),
  //       thursdayPrice: yup.number(),
  //       fridayPrice: yup.number(),
  //       saturdayPrice: yup.number(),
  //       sundayPrice: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }

  // static updateRoomInformation(req: Request) {
  //   const schema = yup
  //     .object({
  //       title: yup.string(),
  //       description: yup.string(),
  //       tags: yup.string().nullable(),
  //       images: yup.string().nullable(),
  //       numberOfBed: yup.number(),
  //       numberOfRoom: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static updateRoomPrice(req: Request) {
  //   const schema = yup
  //     .object({
  //       discount: yup.number(),
  //       mondayPrice: yup.number(),
  //       tuesdayPrice: yup.number(),
  //       wednesdayPrice: yup.number(),
  //       thursdayPrice: yup.number(),
  //       fridayPrice: yup.number(),
  //       saturdayPrice: yup.number(),
  //       sundayPrice: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static getRoomsAvailable(req: Request) {
  //   const schema = yup
  //     .object({
  //       hotelId: yup.number(),
  //       startDate: yup.date(),
  //       endDate: yup.date(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
}
