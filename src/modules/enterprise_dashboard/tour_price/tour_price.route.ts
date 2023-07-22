import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./tour_price.controller";

export const router = Router();

router.route("/").post(staff, Controller.create);

router.route("/:id")
    .put(staff, Controller.update)
    .delete(staff, Controller.delete);
