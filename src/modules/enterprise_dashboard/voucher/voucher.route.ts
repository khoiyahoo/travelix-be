import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./voucher.controller";

export const router = Router();

router
  .route("/")
  .get(staff, Controller.findAll)
  .post(staff, Controller.create);

router
  .route("/:id")
  .get(staff, Controller.findOne)
  .put(staff, Controller.update)
  .delete(staff, Controller.delete)
