import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./room.controller";

export const router = Router();

router
  .route("/")
  .get(staff, Controller.findAll)
  .post(staff, Controller.create);

router
  .route("/check-room")
  .put(staff, Controller.createOrUpdateCheckRoom)

router
  .route("/:id")
  .get(staff, Controller.findOne)
  .put(staff, Controller.update)
  .delete(staff, Controller.delete)
