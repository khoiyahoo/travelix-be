import passport from "passport";
import { Request, Response, NextFunction } from 'express';
import { ETypeUser } from "common/general";

const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (![ETypeUser.SUPER_ADMIN].includes(req.user?.role || 0)) {
    return res.onError({
      status: 401,
      detail: "The user is not an super admin"
    });
  }
  next();
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (![ETypeUser.ADMIN, ETypeUser.SUPER_ADMIN].includes(req.user?.role || 0)) {
    return res.onError({
      status: 401,
      detail: "The user is not an administrator"
    });
  }
  next();
};

const isEnterprise = (req: Request, res: Response, next: NextFunction) => {
  if (![ETypeUser.ENTERPRISE].includes(req.user?.role || 0)) {
    return res.onError({
      status: 401,
      detail: "The user is not an enterprise"
    });
  }
  next();
};

const isStaff = (req: Request, res: Response, next: NextFunction) => {
  if (![ETypeUser.ENTERPRISE, ETypeUser.STAFF].includes(req.user?.role || 0)) {
    return res.onError({
      status: 401,
      detail: "The user is not a staff"
    });
  }
  next();
};

export const auth = passport.authenticate('jwt', { session: false })


export const superAdmin = [auth, isSuperAdmin]
export const admin = [auth, isAdmin]
export const enterprise = [auth, isEnterprise]
export const staff = [auth, isStaff]

export default {
  auth,
  superAdmin,
  admin,
  enterprise,
  staff
};