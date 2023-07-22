import Container, { Inject, Service } from "typedi";
import { sequelize } from "database/models";
import { Response } from "express";
import { ICreateTourComment, IDeclineDeleteTourComment, IGetAllTourComment, IReplyTourComment, IRequestDeleteTourComment, IUpdateTourComment } from "./tourComment.models";
import { Op } from "sequelize";

@Service()
export default class TourCommentService {
  constructor(
    @Inject("tourCommentsModel") private tourCommentsModel: ModelsInstance.TourComments,
    @Inject("toursModel") private toursModel: ModelsInstance.Tours
  ) {}
  /**
   * Get all tour comments
   */
  public async getAllTourComments(data: IGetAllTourComment, res: Response) {
    try {
      const listTourComments = await this.tourCommentsModel.findAll({
        where: {
          tourId: {
            [Op.or]: data.tourIds,
          },
        },
        include: [
          {
            association: "tourReviewer",
          },
          {
            association: "tourInfo",
          },
        ],
      });
      if (!listTourComments) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const tourComments = listTourComments.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(tourComments, {
        message: res.locals.t("get_all_tour_comments_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get tour comments
   */
  public async getTourComments(tourId: number, res: Response) {
    try {
      const listTourComments = await this.tourCommentsModel.findAll({
        where: {
          tourId: tourId,
        },
        include: {
          association: "tourReviewer",
        },
      });
      if (!listTourComments) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const tourComments = listTourComments.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(tourComments, {
        message: res.locals.t("get_tour_comments_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get tour comments need to delete
   */
  public async getTourCommentsNeedDelete(res: Response) {
    try {
      const listTourComments = await this.tourCommentsModel.findAll({
        where: {
          isRequestDelete: true,
        },
        include: [
          {
            association: "tourReviewer",
          },
          {
            association: "tourInfo",
          },
        ],
      });
      if (!listTourComments) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const tourComments = listTourComments.map((item) => {
        return {
          ...item?.dataValues,
        };
      });
      return res.onSuccess(tourComments, {
        message: res.locals.t("get_tour_comments_need_delete_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async createNewTourComment(data: ICreateTourComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const newTourComment = await this.tourCommentsModel.create(
        {
          comment: data?.comment || "",
          rate: data?.rate || 1,
          tourId: data?.tourId,
          userId: data?.userId,
        },
        {
          transaction: t,
        }
      );
      const tour = await this.toursModel.findOne({
        where: {
          id: data?.tourId,
        },
      });
      if (!tour) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: "Tour not found",
        });
      }
      const oldNumberOfReviewer = tour.numberOfReviewer
      const newNumberOfReviewer = tour.numberOfReviewer + 1
      tour.rate = (tour.rate * oldNumberOfReviewer + Number(data?.rate)) / newNumberOfReviewer
      tour.numberOfReviewer = newNumberOfReviewer
      await tour.save({ transaction: t });
      await t.commit();
      return res.onSuccess(newTourComment, {
        message: res.locals.t("tour_comment_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async updateTourComment(commentId: number, data: IUpdateTourComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourCmt = await this.tourCommentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      if (!tourCmt) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("tour_comment_not_found"),
        });
      }
      if (data.comment) tourCmt.comment = data.comment;
      if (data.rate) tourCmt.rate = data.rate;

      await tourCmt.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tourCmt, {
        message: res.locals.t("tour_comment_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async replyTourComment(commentId: number, data: IReplyTourComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourCmt = await this.tourCommentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      if (!tourCmt) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("tour_comment_not_found"),
        });
      }
      // if (data.replyComment) tourCmt.replyComment = data.replyComment;

      await tourCmt.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tourCmt, {
        message: res.locals.t("reply_tour_comment_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async requestDeleteTourComment(commentId: number, data: IRequestDeleteTourComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourCmt = await this.tourCommentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      if (!tourCmt) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("hotel_comment_not_found"),
        });
      }
      // if (data.reasonForDelete) tourCmt.reasonForDelete = data.reasonForDelete;
      // tourCmt.isRequestDelete = true;
      // tourCmt.isDecline = false;

      await tourCmt.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tourCmt, {
        message: res.locals.t("request_delete_hotel_comment_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async declineDeleteTourComment(commentId: number, data: IDeclineDeleteTourComment, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourCmt = await this.tourCommentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      if (!tourCmt) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("hotel_comment_not_found"),
        });
      }
      // if (data.reasonForDecline) tourCmt.reasonForDecline = data.reasonForDecline;
      // tourCmt.isDecline = true;

      await tourCmt.save({ transaction: t });
      await t.commit();
      return res.onSuccess(tourCmt, {
        message: res.locals.t("decline_delete_hotel_comment_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async deleteTourComment(commentId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const tourCmt = await this.tourCommentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      const tour = await this.toursModel.findOne({
        where: {
          id: tourCmt?.tourId,
        },
      });
      const newNumberOfReviewer = tour?.numberOfReviewer - 1;
      const newRate = (tour?.rate * tour?.numberOfReviewer - tourCmt?.rate) / newNumberOfReviewer;
      tour.numberOfReviewer = newNumberOfReviewer;
      tour.rate = newRate;
      
      await tour.save({ transaction: t });
      await this.tourCommentsModel.destroy({
        where: {
          id: commentId,
        },
      });
      await t.commit();
      return res.onSuccess("Delete success", {
        message: res.locals.t("tour_delete_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
