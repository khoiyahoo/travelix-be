import { Router } from "express";
import { admin } from "middlewares";
import Controller from "./commission.controller";

export const router = Router();

router
  .route("/")
  .get(admin, Controller.findAll)
  .post(admin, Controller.create);

router
  .route("/:id")
  .get(admin, Controller.findOne)
  .put(admin, Controller.update)
  .delete(admin, Controller.delete)
