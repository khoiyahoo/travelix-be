import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./tour_on_sale.controller";

export const router = Router();

router.route("/").post(staff, Controller.create).put(staff, Controller.createOrUpdate);

router.route("/:id").get(staff, Controller.findAll).put(staff, Controller.update);
