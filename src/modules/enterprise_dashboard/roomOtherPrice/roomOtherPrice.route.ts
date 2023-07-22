import { Router } from "express";
import Controller from "./roomOtherPrice.controller";
import { staff } from "middlewares";

export const router = Router();

router.route("/").put(staff, Controller.createOrUpdate);

router.route("/:id").get(staff, Controller.findAll).delete(staff, Controller.delete);
