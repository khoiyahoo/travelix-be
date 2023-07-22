import Container from "typedi";
import UserService from "./user.service";
import UserValidation from "./user.validation";
import { Request, Response } from "express";

export default class UserController {
  static login(req: Request, res: Response) {
    try {
      const value = UserValidation.login(req);
      const UserServiceI = Container.get(UserService);
      UserServiceI.login(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  static register(req: Request, res: Response) {
    try {
      const value = UserValidation.register(req);
      const UserServiceI = Container.get(UserService);
      UserServiceI.register(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static me(req: Request, res: Response) {
    try {
      if (req.user) {
        const UserServiceI = Container.get(UserService);
        UserServiceI.me(req.user.id, res);
      } else {
        return res.onError({
          status: 401,
          detail: "userNotFound",
        });
      }
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static verifySignup(req: Request, res: Response) {
    try {
      const value = UserValidation.verifySignup(req);
      const VerifyCodeI = Container.get(UserService);
      VerifyCodeI.verifySignup(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static reSendEmailVerifySignup(req: Request, res: Response) {
    try {
      const value = UserValidation.reSendEmailVerifySignup(req);
      const VerifyCodeI = Container.get(UserService);
      VerifyCodeI.reSendEmailVerifySignup(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static sendEmailForgotPassword(req: Request, res: Response) {
    try {
      const value = UserValidation.sendEmailForgotPassword(req);
      const VerifyCodeI = Container.get(UserService);
      VerifyCodeI.sendEmailForgotPassword(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static changePassword(req: Request, res: Response) {
    try {
      const value = UserValidation.changePassword(req);
      const UserServiceI = Container.get(UserService);
      UserServiceI.changePassword(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static changePassForgot(req: Request, res: Response) {
    try {
      const value = UserValidation.changePassForgot(req);
      const UserServiceI = Container.get(UserService);
      UserServiceI.changePassForgot(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static getUserProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const UserServiceI = Container.get(UserService);
      UserServiceI.getUserProfile( Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static getAllUserProfiles(req: Request, res: Response) {
    try {
      const UserServiceI = Container.get(UserService);
      UserServiceI.getAllUserProfiles(res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateUserProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = UserValidation.updateUserProfile(req);
      const UserServiceI = Container.get(UserService);
      UserServiceI.updateUserProfile(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static updateUserBank(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = UserValidation.updateUserBank(req);
      const UserServiceI = Container.get(UserService);
      UserServiceI.updateUserBank(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static changeLanguage(req: Request, res: Response) {
    try {
      const value = UserValidation.changeLanguage(req)
      const UserServiceI = Container.get(UserService)
      UserServiceI.changeLanguage(req.user, value, res)
    } catch (error) {
      return res.onError({
        detail: error
      })
    }
  }
}
