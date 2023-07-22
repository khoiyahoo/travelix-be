import * as yup from "yup";
import { Request } from "express";

export default class Validation {
  static findAll(req: Request) {
    const schema = yup
      .object({
        serviceId: yup.number().integer().required(),
        serviceType: yup.number().integer().required(),
        take: yup.number().integer().default(10),
        page: yup.number().min(1).integer().default(1),
        keyword: yup.string(),
      })
      .noUnknown();
    return schema.validateSync(req.query);
  }

  static create(req: Request) {
    const schema = yup
      .object({
        content: yup.string().required(),
        rate: yup.number().required(),
        serviceId: yup.number().required(),
        serviceType: yup.number().required(),
        billId: yup.number().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static update(req: Request) {
    const schema = yup
      .object({
        content: yup.string().required(),
        rate: yup.number().required(),
        images: yup.array(yup.string()),
        imagesDeleted: yup.array(yup.string()),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static reply(req: Request) {
    const schema = yup
      .object({
        commentId: yup.number().integer().required(),
        content: yup.string().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static updateReply(req: Request) {
    const schema = yup
      .object({
        content: yup.string().required(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
