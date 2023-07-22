/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { sequelize } from "database/models";
import { Response } from "express";
import { Create, FindAll, Reply, Update, UpdateReply } from "./comment.models";
import { WhereOptions } from "sequelize";
import { EServiceType } from "common/general";
import FileService from "services/file";

@Service()
export default class CommentService {
  constructor(
    @Inject("commentsModel") private commentsModel: ModelsInstance.Comments,
    @Inject("toursModel") private toursModel: ModelsInstance.Tours,
    @Inject("staysModel") private staysModel: ModelsInstance.Stays,
  ) {}
  public async findAll(data: FindAll, res: Response) {
    try {
      const whereOptions: WhereOptions = {
        serviceId: data.serviceId,
        serviceType: data.serviceType,
      };
      let includeOption: any = [];
      if (data.serviceType === EServiceType.TOUR) {
        includeOption = [
          {
            association: "tourInfo",
          },
          {
            association: "reviewer",
          },
          {
            association: "tourBillData",
          },
          {
            association: "replies",
            include: [
              {
                association: "reviewer",
              },
            ],
            order: [["createdAt", "DESC"]],
          },
        ];
      } else {
        includeOption = [
          {
            association: "stayInfo",
          },
          {
            association: "reviewer",
          },
          {
            association: "roomBillData",
          },
          {
            association: "replies",
            include: [
              {
                association: "reviewer",
              },
            ],
            order: [["createdAt", "DESC"]],
          },
        ];
      }

      const offset = data.take * (data.page - 1);
      const listComments = await this.commentsModel.findAndCountAll({
        where: whereOptions,
        include: includeOption,
        limit: data.take,
        order: [["createdAt", "DESC"]],
        offset: offset,
        distinct: true,
      });
      return res.onSuccess(listComments.rows, {
        meta: {
          take: data.take,
          itemCount: listComments.count,
          page: data.page,
          pageCount: Math.ceil(listComments.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async create(data: Create, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const imageUrls = await FileService.uploadAttachments2([...files]);
      // const imageUrls = images?.map((image) => image?.url);

      const newComment = await this.commentsModel.create(
        {
          content: data?.content || "",
          rate: data?.rate || 1,
          serviceId: data?.serviceId,
          serviceType: data?.serviceType,
          billId: data?.billId,
          userId: user.id,
          images: imageUrls,
        },
        {
          transaction: t,
        }
      );

      if (data.serviceType === EServiceType.TOUR) {
        const tour = await this.toursModel.findOne({
          where: {
            id: data?.serviceId,
          },
        });
        if (!tour) {
          await t.rollback();
          return res.onError({
            status: 404,
            detail: "Tour not found",
          });
        }
        const oldNumberOfReviewer = tour.numberOfReviewer;
        const newNumberOfReviewer = tour.numberOfReviewer + 1;
        tour.rate = (tour.rate * oldNumberOfReviewer + Number(data?.rate)) / newNumberOfReviewer;
        tour.numberOfReviewer = newNumberOfReviewer;
        await tour.save({ transaction: t });
      }

      if (data.serviceType === EServiceType.HOTEL) {
        const stay = await this.staysModel.findOne({
          where: {
            id: data?.serviceId,
          },
        });
        if (!stay) {
          await t.rollback();
          return res.onError({
            status: 404,
            detail: "Stay not found",
          });
        }
        const oldNumberOfReviewer = stay.numberOfReviewer;
        const newNumberOfReviewer = stay.numberOfReviewer + 1;
        stay.rate = (stay.rate * oldNumberOfReviewer + Number(data?.rate)) / newNumberOfReviewer;
        stay.numberOfReviewer = newNumberOfReviewer;
        await stay.save({ transaction: t });
      }

      await t.commit();
      return res.onSuccess(newComment, {
        message: res.locals.t("comment_create_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async update(commentId: number, data: Update, files: Express.Multer.File[], user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const comment = await this.commentsModel.findOne({
        where: {
          id: commentId,
          userId: user.id,
        },
      });
      if (!comment) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("comment_not_found"),
        });
      }

      // update rate of service
      if (comment.serviceType === EServiceType.TOUR && comment.rate !== data.rate) {
        const tour = await this.toursModel.findOne({
          where: {
            id: comment.serviceId,
          },
        });
        if (!tour) {
          await t.rollback();
          return res.onError({
            status: 404,
            detail: "Tour not found",
          });
        }
        const rate = tour.rate;
        const numberOfReviewer = tour.numberOfReviewer;
        tour.rate = (rate * numberOfReviewer - comment.rate + Number(data.rate)) / numberOfReviewer;
        await tour.save({ transaction: t });
      }
      if (comment.serviceType === EServiceType.HOTEL && comment.rate !== data.rate) {
        const stay = await this.staysModel.findOne({
          where: {
            id: comment.serviceId,
          },
        });
        if (!stay) {
          await t.rollback();
          return res.onError({
            status: 404,
            detail: "Stay not found",
          });
        }
        const rate = stay.rate;
        const numberOfReviewer = stay.numberOfReviewer;
        stay.rate = (rate * numberOfReviewer - comment.rate + Number(data.rate)) / numberOfReviewer;
        await stay.save({ transaction: t });
      }

      // update comment
      if (data.imagesDeleted) {
        await FileService.deleteFiles2(data.imagesDeleted);
      }
      const imageUrls = await FileService.uploadAttachments2([...files]);
      // const imageUrls = images?.map((image) => image?.url);
      const newImageUrls = (data.images || []).concat(imageUrls);
      comment.content = data.content;
      comment.rate = data.rate;
      comment.images = newImageUrls;

      await comment.save({ transaction: t });
      await t.commit();
      return res.onSuccess(comment, {
        message: res.locals.t("comment_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async reply(data: Reply, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const comment = await this.commentsModel.findOne({
        where: {
          id: data.commentId,
        },
      });
      if (!comment) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("comment_not_found"),
        });
      }

      await this.commentsModel.create(
        {
          userId: user.id,
          content: data.content || "",
          commentRepliedId: data.commentId,
        },
        {
          transaction: t,
        }
      );

      await t.commit();
      return res.onSuccess({
        message: res.locals.t("reply_comment_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async updateReply(commentId: number, data: UpdateReply, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const comment = await this.commentsModel.findOne({
        where: {
          id: commentId,
          userId: user.id,
        },
      });
      if (!comment) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("comment_not_found"),
        });
      }
      comment.content = data.content;

      await comment.save({ transaction: t });
      await t.commit();
      return res.onSuccess(comment, {
        message: res.locals.t("comment_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async delete(commentId: number, user: ModelsAttributes.User, res: Response) {
    const t = await sequelize.transaction();
    try {
      const comment = await this.commentsModel.findOne({
        where: {
          id: commentId,
          userId: user.id,
        },
      });
      if (!comment) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("comment_not_found"),
        });
      }
      // update rate of service
      if (comment.serviceType === EServiceType.TOUR && comment.rate) {
        const tour = await this.toursModel.findOne({
          where: {
            id: comment.serviceId,
          },
        });
        if (!tour) {
          await t.rollback();
          return res.onError({
            status: 404,
            detail: "Tour not found",
          });
        }
        const rate = tour.rate;
        const numberOfReviewer = tour.numberOfReviewer;
        tour.rate = (rate * numberOfReviewer - comment.rate) / (numberOfReviewer - 1);
        tour.numberOfReviewer = numberOfReviewer - 1
        await tour.save({ transaction: t });
      }
      if (comment.serviceType === EServiceType.HOTEL && comment.rate) {
        const stay = await this.staysModel.findOne({
          where: {
            id: comment.serviceId,
          },
        });
        if (!stay) {
          await t.rollback();
          return res.onError({
            status: 404,
            detail: "Stay not found",
          });
        }
        const rate = stay.rate;
        const numberOfReviewer = stay.numberOfReviewer;
        stay.rate = (rate * numberOfReviewer - comment.rate) / (numberOfReviewer - 1);
        stay.numberOfReviewer = numberOfReviewer - 1
        await stay.save({ transaction: t });
      }

      await comment.destroy({ transaction: t });
      await t.commit();
      return res.onSuccess({
        message: res.locals.t("comment_delete_success"),
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
