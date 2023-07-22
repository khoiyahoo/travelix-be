// import * as yup from "yup";
// import { Request } from "express";

// export default class HotelValidation {
//   static createNewHotel(req: Request) {
//     const schema = yup
//       .object({
//         name: yup.string(),
//         description: yup.string(),
//         checkInTime: yup.string(),
//         checkOutTime: yup.string(),
//         location: yup.string(),
//         contact: yup.string(),
//         tags: yup.string().nullable(),
//         images: yup.string().nullable(),
//         creator: yup.number(),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }

//   static updateHotel(req: Request) {
//     const schema = yup
//       .object({
//         name: yup.string(),
//         description: yup.string(),
//         checkInTime: yup.string(),
//         checkOutTime: yup.string(),
//         location: yup.string(),
//         contact: yup.string(),
//         tags: yup.string().nullable(),
//         images: yup.string().nullable(),
//       })
//       .noUnknown()
//       .required();
//     return schema.validateSync(req.body);
//   }
// }
