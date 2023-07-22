import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./tour_schedule.controller";

export const router = Router();

// router.route("/").post(staff, Controller.createOne).put(staff, Controller.createOrUpdate);
router.route("/").get(staff, Controller.findAll).put(staff, Controller.createOrUpdate);

// router.route("/multi").post(staff, Controller.createMultiple);
router.route("/multi/:tourId/:day").delete(staff, Controller.deleteMultiple);

// router.route("/:id").put(staff, Controller.update).delete(staff, Controller.delete);
router.route("/:id").delete(staff, Controller.delete);
