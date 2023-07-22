/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Service } from "typedi";
import { sequelize } from "database/models";
import { Response } from "express";
import { FindAll } from "./comment.models";
import { WhereOptions } from "sequelize";
import { EServiceType } from "common/general";

@Service()
export default class CommentService {
  constructor(
    @Inject("commentsModel") private commentsModel: ModelsInstance.Comments,
  ) {}
  public async findAll(data: FindAll, res: Response) {
    try {
      let whereOptions: WhereOptions = {
        serviceId: data.serviceId,
        serviceType: data.serviceType,
      };
      if(data.rate !== -1) {
        whereOptions = {
          ...whereOptions,
          rate: data.rate
        }
      }
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
        offset: offset,
        distinct: true,
        order: [["createdAt", "DESC"]],
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

  public async delete(commentId: number, res: Response) {
    const t = await sequelize.transaction();
    try {
      const comment = await this.commentsModel.findOne({
        where: {
          id: commentId,
        },
      });
      if (!comment) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("comment_not_found"),
        });
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
