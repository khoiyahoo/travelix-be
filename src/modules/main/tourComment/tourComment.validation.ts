import * as yup from "yup";
import { Request } from "express";

export default class TourCommentValidation {
  static createNewTourComment(req: Request) {
    const schema = yup
      .object({
        comment: yup.string(),
        rate: yup.string(),
        tourId: yup.number(),
        userId: yup.number(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }

  static updateTourComment(req: Request) {
    const schema = yup
      .object({
        comment: yup.string(),
        rate: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static replyTourComment(req: Request) {
    const schema = yup
      .object({
        replyComment: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static requestDeleteTourComment(req: Request) {
    const schema = yup
      .object({
        reasonForDelete: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static declineDeleteTourComment(req: Request) {
    const schema = yup
      .object({
        reasonForDecline: yup.string(),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
  
  static getAllTourComments(req: Request) {
    const schema = yup
      .object({
        tourIds: yup.array().of(yup.number()),
      })
      .noUnknown()
      .required();
    return schema.validateSync(req.body);
  }
}
