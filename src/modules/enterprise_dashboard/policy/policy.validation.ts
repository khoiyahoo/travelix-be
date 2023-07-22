import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        serviceId: yup.number(),
        serviceType: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.query);
  }

  static createOrUpdate(req: Request) {
    const schema = yup
      .array(
        yup.object({
          id: yup.number(),
          serviceId: yup.number(),
          serviceType: yup.number(),
          policyType: yup.number(),
          dayRange: yup.number(),
          moneyRate: yup.number(),
        })
      )
      .required();
    return schema.validateSync(req.body);
  }
}
