import { Inject, Service } from "typedi";
import { ChangeRole, FindAll } from "./user.models";
import { Response } from "express";
import { WhereOptions } from "sequelize/types";

@Service()
export default class UserService {
  constructor(
    @Inject("usersModel") private usersModel: ModelsInstance.Users,
  ) {}
  /**
   * Get all user profile
   */
   public async findAll(data: FindAll, res: Response) {
    try {
      let offset = data.take * (data.page - 1);

      const listUsers = await this.usersModel.findAndCountAll({
        include: [
          {
            association: "enterprise",
          },
        ],
        limit: data.take,
        offset: offset,
        distinct: true,
      });

      return res.onSuccess(listUsers.rows, {
        meta: {
          take: data.take,
          itemCount: listUsers.count,
          page: data.page,
          pageCount: Math.ceil(listUsers.count / data.take),
        },
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Change role
   */
  public async changeRole(data: ChangeRole, res: Response) {
    try {
      const user = await this.usersModel.findOne({
        where: {
          id: data.userId
        }
      })
      if (!user) {
        return res.onError({
          status: 404,
          detail: res.locals.t('auth_user_not_found')
        })
      }
      user.role = data.role
      await user.save({ silent: true })
      return res.onSuccess({}, {
        message: res.locals.t('common_update_success')
      })
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error
      })
    }
  }

  /**
   * Delete user
   */
  public async delete(userId: number, res: Response) {
    try {
      const user = await this.usersModel.findOne({
        where: {
          id: userId
        }
      })
      if (!user) {
        return res.onError({
          status: 404,
          detail: res.locals.t('auth_user_not_found')
        })
      }
      user.isDeleted = true
      await user.save({ silent: true })
      return res.onSuccess({}, {
        message: res.locals.t('common_update_success')
      })
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error
      })
    }
  }
}
