import Container, { Inject, Service } from "typedi";
import bcrypt from "bcryptjs";
import {
  ChangeLanguage,
  IChangePassForgot,
  IChangePassword,
  ILogin,
  IRegister,
  IReSendVerifySignup,
  ISendEmailForgotPassword,
  IUpdateUserBank,
  IUpdateUserProfile,
  IVerifySignup,
} from "./user.models";
import database, { sequelize } from "database/models";
import { Response } from "express";
import EmailService from "services/emailService";
import jwt from "helper/jwt";
import { WhereOptions } from "sequelize/types";
import { v4 as uuidv4 } from "uuid";
import { ETypeVerifyCode } from "common/general";
import moment from "moment";

const hashUserPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const comparePassword = (plainText: string, encrypedPassword: string) => {
  return bcrypt.compareSync(plainText || "", encrypedPassword);
};

@Service()
export default class UserService {
  constructor(
    @Inject("usersModel") private usersModel: ModelsInstance.Users,
    @Inject("verifyCodesModel") private verifyCodesModel: ModelsInstance.VerifyCodes
  ) {}
  public async register(data: IRegister, res: Response) {
    const t = await sequelize.transaction();
    try {
      const user = await this.usersModel.findOne({
        where: {
          username: data.username,
        },
      });
      if (user) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("Email address already exist!"),
        });
      }
      if (data?.password !== data?.confirmPassword) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("Password and confirm password does not match!"),
        });
      }
      const hashedPassword = await hashUserPassword(data?.password);

      const userNew = await this.usersModel.create(
        {
          username: data?.username,
          password: hashedPassword,
          role: data?.role || 3,
          avatar: data?.avatar || null,
          firstName: data?.firstName,
          lastName: data?.lastName,
          address: data?.address || null,
          phoneNumber: data?.phoneNumber,
        },
        {
          transaction: t,
        }
      );

      const verifyCode = await this.verifyCodesModel.create(
        {
          code: uuidv4(),
          userId: userNew.id,
          type: ETypeVerifyCode.VERIFY_EMAIL,
          expiredDate: moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate(),
        },
        { transaction: t }
      );
      const emailRes = await EmailService.sendConfirmSignUp(
        data?.username,
        `${process.env.SITE_URL}/auth/verifySignup?code=${verifyCode.code}&userId=${verifyCode.userId}`
      );
      if (emailRes.isSuccess) {
        await t.commit();
        return res.onSuccess(userNew, {
          message: res.locals.t("Create user success!"),
        });
      } else {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "email_sending_failed",
        });
      }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async login(data: ILogin, res: Response) {
    try {
      const user = await this.usersModel.findOne({
        where: {
          username: data.username,
        },
      });
      if (!user) {
        return res.onError({
          status: 400,
          detail: res.locals.t("login_invalid_error"),
        });
      }
      const authenticated = comparePassword(data.password, user.password || "");
      if (!authenticated) {
        return res.onError({
          status: 400,
          detail: res.locals.t("login_invalid_error"),
        });
      }
      if (!user.isVerified) {
        return res.onError({
          status: 400,
          detail: "notVerified", // not set i18
        });
      }
      const _user = user.toJSON() as ModelsAttributes.User;
      delete _user.password;
      const token = jwt.issue(_user);

      return res.onSuccess({
        user: _user,
        token,
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async changePassword(data: IChangePassword, res: Response) {
    const t = await sequelize.transaction();
    try {
      // user
      const user = await this.usersModel.findOne({
        where: {
          id: data?.userId,
        },
      });
      if (!user) {
        return res.onError({
          status: 400,
          detail: res.locals.t("user_not_found"),
        });
      }

      const authenticated = comparePassword(data.currentPassword, user.password || "");
      if (!authenticated) {
        return res.onError({
          status: 400,
          detail: res.locals.t("Current password is not correct!"),
        });
      }
      if (data?.newPassword !== data?.confirmPassword) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("Password and confirm password does not match!"),
        });
      }
      const hashedPassword = await hashUserPassword(data?.newPassword);
      user.password = hashedPassword;

      await user.save({ transaction: t });

      await t.commit();
      return res.onSuccess({
        detail: res.locals.t("Complete change password"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  private async getUser(id?: number, email?: string) {
    if (!id && !email) return;
    let whereOptions: WhereOptions = {};
    if (id) {
      whereOptions = {
        id: id,
      };
    } else {
      whereOptions = {
        username: email,
      };
    }
    const user = await this.usersModel.findOne({
      where: whereOptions,
      attributes: {
        exclude: ["password"],
      },
    });
    return user;
  }

  public async me(id: number, res: Response) {
    try {
      const user = await this.getUser(id);
      if (!user) {
        return res.onError({
          status: 404,
          detail: res.locals.t("auth_user_not_found"),
        });
      }
      return res.onSuccess(user);
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async verifySignup(data: IVerifySignup, res: Response) {
    const t = await sequelize.transaction();
    try {
      // verify code
      const item = await this.verifyCodesModel.findOne({
        where: {
          code: data.code,
          userId: data.userId,
          type: ETypeVerifyCode.VERIFY_EMAIL,
        },
      });
      if (!item) {
        return res.onError({
          status: 404,
          detail: res.locals.t("not_found"),
        });
      }

      if (new Date() < new Date(item?.expiredDate)) {
        item.code = null;
        await item.save({ transaction: t });

        // user
        const user = await this.usersModel.findOne({
          where: {
            id: data.userId,
          },
        });
        if (!user) {
          return res.onError({
            status: 400,
            detail: res.locals.t("user_not_found"),
          });
        }
        user.isVerified = true;
        await user.save({ transaction: t });
        await t.commit();
        return res.onSuccess({
          detail: res.locals.t("complete_verification"),
        });
      } else {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("the_verification_code_has_expired"),
        });
      }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async reSendEmailVerifySignup(data: IReSendVerifySignup, res: Response) {
    const t = await sequelize.transaction();
    try {
      // user
      const user = await this.usersModel.findOne({
        where: {
          username: data.email,
        },
      });
      if (!user) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("user_not_found"),
        });
      }
      // verify code
      const item = await this.verifyCodesModel.findOne({
        where: {
          userId: user.id,
        },
      });
      if (!item) {
        return res.onError({
          status: 404,
          detail: res.locals.t("not_found"),
        });
      }
      const codeVerify = uuidv4();
      item.code = codeVerify;
      item.type = ETypeVerifyCode.VERIFY_EMAIL;
      item.expiredDate = moment().add(process.env.MAXAGE_TOKEN_ACTIVE, "hours").toDate();

      // email
      const emailRes = await EmailService.sendConfirmSignUp(
        data.email,
        `${process.env.SITE_URL}/auth/verifySignup?code=${codeVerify}&userId=${user.id}`
      );
      if (emailRes.isSuccess) {
        await item.save({ transaction: t });
        await t.commit();
        return res.onSuccess({
          detail: res.locals.t("sent_email_verify_signup_again"),
        });
      } else {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "email_sending_failed",
        });
      }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async sendEmailForgotPassword(data: ISendEmailForgotPassword, res: Response) {
    const t = await sequelize.transaction();
    try {
      // user
      const user = await this.usersModel.findOne({
        where: {
          username: data?.email,
        },
      });
      if (!user) {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("user_not_found"),
        });
      }

      // verify code
      const item = await this.verifyCodesModel.findOne({
        where: {
          userId: user.id,
        },
      });
      if (!item) {
        return res.onError({
          status: 404,
          detail: res.locals.t("not_found"),
        });
      }
      const codeVerify = (Math.floor(Math.random() * 999999) + 100000).toString();
      item.code = codeVerify;
      item.type = ETypeVerifyCode.FORGOT_PASSWORD;
      item.expiredDate = moment().add(process.env.MAXAGE_TOKEN_FORGOT_PASSWORD, "hours").toDate();

      // email
      const emailRes = await EmailService.sendForgotPassword(user?.username, codeVerify);
      if (emailRes.isSuccess) {
        await item.save({ transaction: t });
        await t.commit();
        return res.onSuccess({
          detail: res.locals.t("sent_email_forgot_password"),
        });
      } else {
        await t.rollback();
        return res.onError({
          status: 500,
          detail: "email_sending_failed",
        });
      }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  public async changePassForgot(data: IChangePassForgot, res: Response) {
    const t = await sequelize.transaction();
    try {
      // user
      const user = await this.usersModel.findOne({
        where: {
          username: data.email,
        },
      });
      if (!user) {
        return res.onError({
          status: 400,
          detail: res.locals.t("user_not_found"),
        });
      }
      // verify code
      const item = await this.verifyCodesModel.findOne({
        where: {
          code: data.code,
          userId: user.id,
          type: ETypeVerifyCode.FORGOT_PASSWORD,
        },
      });
      if (!item) {
        return res.onError({
          status: 404,
          detail: res.locals.t("Not found the code verification"),
        });
      }

      if (new Date() < new Date(item?.expiredDate)) {
        if (data?.password !== data?.confirmPassword) {
          await t.rollback();
          return res.onError({
            status: 400,
            detail: res.locals.t("Password and confirm password does not match!"),
          });
        }
        const hashedPassword = await hashUserPassword(data?.password);
        user.password = hashedPassword;
        item.code = null;

        await user.save({ transaction: t });
        await item.save({ transaction: t });

        await t.commit();
        return res.onSuccess({
          detail: res.locals.t("complete_change_password"),
        });
      } else {
        await t.rollback();
        return res.onError({
          status: 400,
          detail: res.locals.t("the_verification_code_has_expired"),
        });
      }
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get user profile
   */
  public async getUserProfile(id: number, res: Response) {
    try {
      const user = await this.usersModel.findOne({
        attributes: [
          "id",
          ["username", "email"],
          "avatar",
          "firstName",
          "lastName",
          "address",
          "phoneNumber",
          "bankType",
          "bankCode",
          "bankName",
          "bankCardNumber",
          "bankUserName",
          "releaseDate",
          "expirationDate",
          "cvcOrCvv",
          "bankEmail",
          "bankCountry",
          "bankProvinceOrCity",
          "bankUserAddress",
        ],
        where: {
          id: id,
        },
      });
      if (!user) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      return res.onSuccess(user, {
        message: res.locals.t("get_user_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Get all user profile
   */
  public async getAllUserProfiles(res: Response) {
    try {
      const allUser = await this.usersModel.findAll({
        where: {
          isDeleted: false,
        },
      });
      if (!allUser) {
        return res.onError({
          status: 404,
          detail: "Not found",
        });
      }
      const result = <any>[];
      allUser.map((user) => {
        const _user = { ...user.dataValues };
        result.push({
          id: _user?.id,
          email: _user?.username,
          avatar: _user?.avatar,
          firstName: _user?.firstName,
          lastName: _user?.lastName,
          address: _user?.address,
          phoneNumber: _user?.phoneNumber,
          role: _user?.role,
        });
      });
      return res.onSuccess(result, {
        message: res.locals.t("get_user_success"),
      });
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(id: number, data: IUpdateUserProfile, res: Response) {
    const t = await sequelize.transaction();
    try {
      const user = await this.usersModel.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });
      if (!user) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("user_not_found"),
        });
      }
      if (data.avatar) user.avatar = data.avatar;
      if (data.firstName) user.firstName = data.firstName;
      if (data.lastName) user.lastName = data.lastName;
      if (data.address) user.address = data.address;
      if (data.phoneNumber) user.phoneNumber = data.phoneNumber;

      await user.save({ transaction: t });
      await t.commit();
      return res.onSuccess(user, {
        message: res.locals.t("user_profile_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * Update user bank
   */
  public async updateUserBank(id: number, data: IUpdateUserBank, res: Response) {
    const t = await sequelize.transaction();
    try {
      const user = await this.usersModel.findOne({
        where: {
          id: id,
          isDeleted: false,
        },
      });
      if (!user) {
        await t.rollback();
        return res.onError({
          status: 404,
          detail: res.locals.t("user_not_found"),
        });
      }
      user.bankType = data.bankType;
      user.bankCode = data.bankCode || null;
      user.bankName = data.bankName || null;
      user.bankCardNumber = data.bankCardNumber;
      user.bankUserName = data.bankUserName;
      user.releaseDate = data.releaseDate || null;
      user.expirationDate = data.expirationDate || null;
      user.cvcOrCvv = data.cvcOrCvv || "";
      user.bankEmail = data.bankEmail || "";
      user.bankCountry = data.bankCountry || "";
      user.bankProvinceOrCity = data.bankProvinceOrCity || "";
      user.bankUserAddress = data.bankUserAddress || "";

      await user.save({ transaction: t });
      await t.commit();
      return res.onSuccess(user, {
        message: res.locals.t("user_bank_update_success"),
      });
    } catch (error) {
      await t.rollback();
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }

  /**
   * v1.2
   */
  public async changeLanguage(_user: ModelsAttributes.User, data: ChangeLanguage, res: Response) {
    try {
      const user = await this.usersModel.findOne({
        where: {
          id: _user.id,
        },
      });
      if (!user) {
        return res.onError({
          status: 404,
          detail: res.locals.t("auth_user_not_found"),
        });
      }
      user.language = data.language;
      await user.save({ silent: true });
      return res.onSuccess(
        {},
        {
          message: res.locals.t("common_update_success"),
        }
      );
    } catch (error) {
      return res.onError({
        status: 500,
        detail: error,
      });
    }
  }
}
