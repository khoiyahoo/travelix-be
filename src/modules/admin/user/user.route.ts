import { Router } from "express";
import { admin } from "middlewares";
import UserController from "./user.controller";

export const userRouter = Router();

userRouter.route("/").get(admin, UserController.findAll);
userRouter.route("/delete/:id").put(admin, UserController.delete);
userRouter.route("/change-role").put(admin, UserController.changeRole);
