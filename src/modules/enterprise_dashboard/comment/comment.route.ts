import { Router } from "express";
import Controller from "./comment.controller";
import { staff } from "middlewares";

export const commentRouter = Router();

commentRouter.route("/").get(staff, Controller.findAll);
commentRouter.route("/:id").delete(staff, Controller.delete);
