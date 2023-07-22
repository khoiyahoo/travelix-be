// import * as yup from "yup";
// import { Request } from "express";

// export default class HotelCommentValidation {
//   static createNewHotelComment(req: Request) {
//     const schema = yup
//       .object({
//         comment: yup.string(),
//         rate: yup.string(),
//         hotelId: yup.number(),
//         billId: yup.number(),
//         userId: yup.number(),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }

//   static updateHotelComment(req: Request) {
//     const schema = yup
//       .object({
//         comment: yup.string(),
//         rate: yup.string(),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }
  
//   static replyHotelComment(req: Request) {
//     const schema = yup
//       .object({
//         replyComment: yup.string(),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }
  
//   static requestDeleteHotelComment(req: Request) {
//     const schema = yup
//       .object({
//         reasonForDelete: yup.string(),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }
  
//   static declineDeleteHotelComment(req: Request) {
//     const schema = yup
//       .object({
//         reasonForDecline: yup.string(),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }
  
//   static getAllHotelComments(req: Request) {
//     const schema = yup
//       .object({
//         hotelIds: yup.array().of(yup.number()),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }
// }
