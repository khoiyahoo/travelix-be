// import Container, { Inject, Service } from "typedi";
// import { sequelize } from "database/models";
// import { Response } from "express";
// import {
//   ICreateHotelComment,
//   IDeclineHotelComment,
//   IGetAllHotelComment,
//   IReplyHotelComment,
//   IRequestDeleteHotelComment,
//   IUpdateHotelComment,
// } from "./hotelComment.models";
// import { Op } from "sequelize";

// @Service()
// export default class HotelCommentService {
//   constructor(
//     @Inject("hotelCommentsModel") private hotelCommentsModel: ModelsInstance.HotelComments,
//     @Inject("hotelsModel") private hotelsModel: ModelsInstance.Hotels
//   ) {}
//   /**
//    * Get all hotel comments
//    */
//   public async getAllHotelComments(data: IGetAllHotelComment, res: Response) {
//     try {
//       const listHotelComments = await this.hotelCommentsModel.findAll({
//         where: {
//           hotelId: {
//             [Op.or]: data.hotelIds,
//           },
//         },
//         include: [
//           {
//             association: "hotelReviewer",
//           },
//           {
//             association: "hotelInfo",
//           },
//         ],
//       });
//       if (!listHotelComments) {
//         return res.onError({
//           status: 404,
//           detail: "Not found",
//         });
//       }
//       const hotelComments = listHotelComments.map((item) => {
//         return {
//           ...item?.dataValues,
//         };
//       });
//       return res.onSuccess(hotelComments, {
//         message: res.locals.t("get_all_hotel_comments_success"),
//       });
//     } catch (error) {
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }
//   /**
//    * Get hotel comments
//    */
//   public async getHotelComments(hotelId: number, res: Response) {
//     try {
//       const listHotelComments = await this.hotelCommentsModel.findAll({
//         where: {
//           hotelId: hotelId,
//         },
//         include: {
//           association: "hotelReviewer",
//         },
//       });
//       if (!listHotelComments) {
//         return res.onError({
//           status: 404,
//           detail: "Not found",
//         });
//       }
//       const hotelComments = listHotelComments.map((item) => {
//         return {
//           ...item?.dataValues,
//         };
//       });
//       return res.onSuccess(hotelComments, {
//         message: res.locals.t("get_hotel_comments_success"),
//       });
//     } catch (error) {
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }
//   /**
//    * Get hotel comments need to delete
//    */
//   public async getHotelCommentsNeedDelete(res: Response) {
//     try {
//       const listHotelComments = await this.hotelCommentsModel.findAll({
//         where: {
//           isRequestDelete: true,
//         },
//         include: [
//           {
//             association: "hotelReviewer",
//           },
//           {
//             association: "hotelInfo",
//           },
//         ],
//       });
//       if (!listHotelComments) {
//         return res.onError({
//           status: 404,
//           detail: "Not found",
//         });
//       }
//       const hotelComments = listHotelComments.map((item) => {
//         return {
//           ...item?.dataValues,
//         };
//       });
//       return res.onSuccess(hotelComments, {
//         message: res.locals.t("get_hotel_comments_need_to_delete_success"),
//       });
//     } catch (error) {
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }

//   public async createNewHotelComment(data: ICreateHotelComment, res: Response) {
//     const t = await sequelize.transaction();
//     try {
//       const newHotelComment = await this.hotelCommentsModel.create(
//         {
//           comment: data?.comment || "",
//           rate: data?.rate || 1,
//           hotelId: data?.hotelId,
//           billId: data?.billId,
//           userId: data?.userId,
//         },
//         {
//           transaction: t,
//         }
//       );
//       const hotel = await this.hotelsModel.findOne({
//         where: {
//           id: data?.hotelId,
//         },
//       });
//       if (!hotel) {
//         await t.rollback();
//         return res.onError({
//           status: 404,
//           detail: "Hotel not found",
//         });
//       }
//       const oldNumberOfReviewer = hotel.numberOfReviewer;
//       const newNumberOfReviewer = hotel.numberOfReviewer + 1;
//       hotel.rate = (hotel.rate * oldNumberOfReviewer + Number(data?.rate)) / newNumberOfReviewer;
//       hotel.numberOfReviewer = newNumberOfReviewer;
//       await hotel.save({ transaction: t });
//       await t.commit();
//       return res.onSuccess(newHotelComment, {
//         message: res.locals.t("hotel_comment_create_success"),
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }

//   public async updateHotelComment(commentId: number, data: IUpdateHotelComment, res: Response) {
//     const t = await sequelize.transaction();
//     try {
//       const hotelCmt = await this.hotelCommentsModel.findOne({
//         where: {
//           id: commentId,
//         },
//       });
//       if (!hotelCmt) {
//         await t.rollback();
//         return res.onError({
//           status: 404,
//           detail: res.locals.t("hotel_comment_not_found"),
//         });
//       }
//       if (data.comment) hotelCmt.comment = data.comment;
//       if (data.rate) hotelCmt.rate = data.rate;

//       await hotelCmt.save({ transaction: t });
//       await t.commit();
//       return res.onSuccess(hotelCmt, {
//         message: res.locals.t("hotel_comment_update_success"),
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }

//   public async replyHotelComment(commentId: number, data: IReplyHotelComment, res: Response) {
//     const t = await sequelize.transaction();
//     try {
//       const hotelCmt = await this.hotelCommentsModel.findOne({
//         where: {
//           id: commentId,
//         },
//       });
//       if (!hotelCmt) {
//         await t.rollback();
//         return res.onError({
//           status: 404,
//           detail: res.locals.t("hotel_comment_not_found"),
//         });
//       }
//       if (data.replyComment) hotelCmt.replyComment = data.replyComment;

//       await hotelCmt.save({ transaction: t });
//       await t.commit();
//       return res.onSuccess(hotelCmt, {
//         message: res.locals.t("reply_hotel_comment_success"),
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }

//   public async requestDeleteHotelComment(commentId: number, data: IRequestDeleteHotelComment, res: Response) {
//     const t = await sequelize.transaction();
//     try {
//       const hotelCmt = await this.hotelCommentsModel.findOne({
//         where: {
//           id: commentId,
//         },
//       });
//       if (!hotelCmt) {
//         await t.rollback();
//         return res.onError({
//           status: 404,
//           detail: res.locals.t("hotel_comment_not_found"),
//         });
//       }
//       if (data.reasonForDelete) hotelCmt.reasonForDelete = data.reasonForDelete;
//       hotelCmt.isRequestDelete = true;
//       hotelCmt.isDecline = false;

//       await hotelCmt.save({ transaction: t });
//       await t.commit();
//       return res.onSuccess(hotelCmt, {
//         message: res.locals.t("request_delete_hotel_comment_success"),
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }

//   public async declineDeleteHotelComment(commentId: number, data: IDeclineHotelComment, res: Response) {
//     const t = await sequelize.transaction();
//     try {
//       const hotelCmt = await this.hotelCommentsModel.findOne({
//         where: {
//           id: commentId,
//         },
//       });
//       if (!hotelCmt) {
//         await t.rollback();
//         return res.onError({
//           status: 404,
//           detail: res.locals.t("hotel_comment_not_found"),
//         });
//       }
//       if (data.reasonForDecline) hotelCmt.reasonForDecline = data.reasonForDecline;
//       hotelCmt.isDecline = true;

//       await hotelCmt.save({ transaction: t });
//       await t.commit();
//       return res.onSuccess(hotelCmt, {
//         message: res.locals.t("decline-delete_hotel_comment_success"),
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }

//   public async deleteHotelComment(commentId: number, res: Response) {
//     const t = await sequelize.transaction();
//     try {
//       const hotelCmt = await this.hotelCommentsModel.findOne({
//         where: {
//           id: commentId,
//         },
//       });
//       const hotel = await this.hotelsModel.findOne({
//         where: {
//           id: hotelCmt?.hotelId,
//         },
//       });
//       const newNumberOfReviewer = hotel?.numberOfReviewer - 1;
//       const newRate = (hotel?.rate * hotel?.numberOfReviewer - hotelCmt?.rate) / newNumberOfReviewer;
//       hotel.numberOfReviewer = newNumberOfReviewer;
//       hotel.rate = newRate;
      
//       await hotel.save({ transaction: t });
//       await this.hotelCommentsModel.destroy({
//         where: {
//           id: commentId,
//         },
//       });
//       await t.commit();
//       return res.onSuccess("Delete success", {
//         message: res.locals.t("hotel_comment_delete_success"),
//       });
//     } catch (error) {
//       await t.rollback();
//       return res.onError({
//         status: 500,
//         detail: error,
//       });
//     }
//   }
// }
