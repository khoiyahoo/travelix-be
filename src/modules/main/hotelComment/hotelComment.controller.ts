// import Container from "typedi";
// import { Request, Response } from "express";
// import HotelCommentService from "./hotelComment.service";
// import HotelCommentValidation from "./hotelComment.validation";

// export default class HotelCommentController {
//   static getHotelComments(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.getHotelComments(Number(id), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static getAllHotelComments(req: Request, res: Response) {
//     try {
//       const value = HotelCommentValidation.getAllHotelComments(req);
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.getAllHotelComments(value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static getHotelCommentsNeedDelete(req: Request, res: Response) {
//     try {
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.getHotelCommentsNeedDelete(res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static createNewHotelComment(req: Request, res: Response) {
//     try {
//       const value = HotelCommentValidation.createNewHotelComment(req);
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.createNewHotelComment(value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static updateHotelComment(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const value = HotelCommentValidation.updateHotelComment(req);
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.updateHotelComment(Number(id), value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
  
//   static replyHotelComment(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const value = HotelCommentValidation.replyHotelComment(req);
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.replyHotelComment(Number(id), value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
  
//   static requestDeleteHotelComment(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const value = HotelCommentValidation.requestDeleteHotelComment(req);
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.requestDeleteHotelComment(Number(id), value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
  
//   static declineDeleteHotelComment(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const value = HotelCommentValidation.declineDeleteHotelComment(req);
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.declineDeleteHotelComment(Number(id), value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static deleteHotelComment(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const HotelCommentServiceI = Container.get(HotelCommentService);
//       HotelCommentServiceI.deleteHotelComment(Number(id), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
// }
