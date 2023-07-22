import * as yup from "yup";
import { Request } from "express";
import { VALIDATION } from "config/constants";

export default class Validation {
  static create(req: Request) {
    const schema = yup
      .object({
        stayId: yup.number(),
        rooms: yup.array(
          yup.object({
            roomId: yup.number(),
            amount: yup.number(),
            discount: yup.number(),
            price: yup.string(),
            bookedDate: yup.string(),
          })
        ),
        startDate: yup.string(),
        endDate: yup.string(),
        price: yup.number(),
        discount: yup.number(),
        totalBill: yup.number(),
        email: yup.string().email(),
        phoneNumber: yup.string().matches(VALIDATION.phone, {
          message: req.t("field_phone_number_vali_phone"),
          excludeEmptyString: true,
        }),
        firstName: yup.string(),
        lastName: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static reSchedule(req: Request) {
    const schema = yup
      .object({
        stayId: yup.number(),
        rooms: yup.array(
          yup.object({
            roomId: yup.number(),
            amount: yup.number(),
            discount: yup.number(),
            price: yup.string(),
            bookedDate: yup.string(),
          })
        ),
        startDate: yup.string(),
        endDate: yup.string(),
        price: yup.number(),
        discount: yup.number(),
        totalBill: yup.number(),
        extraPay: yup.number().nullable(),
        moneyRefund: yup.number().nullable(),
        email: yup.string().email(),
        phoneNumber: yup.string().matches(VALIDATION.phone, {
          message: req.t("field_phone_number_vali_phone"),
          excludeEmptyString: true,
        }),
        firstName: yup.string(),
        lastName: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static update(req: Request) {
    const schema = yup
      .object({
        paymentStatus: yup.number(),
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
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static cancel(req: Request) {
    const schema = yup
      .object({
        moneyRefund: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  // static verifyBookRoom(req: Request) {
  //   const schema = yup
  //     .object({
  //       code: yup.string(),
  //       billId: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static getAllRoomBillsAnyDate(req: Request) {
  //   const schema = yup
  //     .object({
  //       hotelId: yup.number(),
  //       date: yup.date(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static getRevenueOfHotelsByMonth(req: Request) {
  //   const schema = yup
  //     .object({
  //       hotelIds: yup.array().of(yup.number()),
  //       month: yup.number(),
  //       year: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
  
  // static getRevenueOfHotelsByYear(req: Request) {
  //   const schema = yup
  //     .object({
  //       hotelIds: yup.array().of(yup.number()),
  //       year: yup.number(),
  //     })
  //     .noUnknown()
  //     .required();
  //   return schema.validateSync(req.body);
  // }
}
