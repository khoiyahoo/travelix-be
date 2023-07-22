import * as yup from "yup";
import { Request } from "express";

export default class RoomPriceValidation {
  static getPrice(req: Request) {
    const schema = yup
      .object({
        date: yup.date(),
        roomId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static createNewPrice(req: Request) {
    const schema = yup
      .object({
        date: yup.date(),
        price: yup.number(),
        roomId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static updatePrice(req: Request) {
    const schema = yup
      .object({
        date: yup.date(),
        price: yup.number(),
        roomId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
