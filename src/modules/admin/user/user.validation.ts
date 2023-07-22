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

  static changeRole(req: Request) {
    const schema = yup
      .object({
        userId: yup.number().integer().required(),
        role: yup
          .number()
          .oneOf([ETypeUser.SUPER_ADMIN, ETypeUser.ADMIN, ETypeUser.ENTERPRISE, ETypeUser.STAFF, ETypeUser.USER])
          .required(),
      })
      .noUnknown();
    return schema.validateSync(req.body);
  }
}
