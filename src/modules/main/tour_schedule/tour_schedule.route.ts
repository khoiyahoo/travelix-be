import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./tour_schedule.controller";

export const router = Router();

router.route("/:tourId").get(Controller.findAll);
