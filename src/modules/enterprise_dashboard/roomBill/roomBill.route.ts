import { Router } from "express";
import Controller from "./roomBill.controller";
import { enterprise, staff } from "middlewares";

export const router = Router();

router.route("/").get(staff, Controller.findAll);
router.route("/filter").get(staff, Controller.getFilters);
router.route("/statistic").get(enterprise, Controller.statisticAll);
router.route("/statistic/staff/:id").get(enterprise, Controller.findAllStaffBill);
router.route("/statistic/room/:id").get(enterprise, Controller.statisticOneRoom);
router.route("/statistic/:id").get(enterprise, Controller.statisticOneStay);
router.route("/:id").get(staff, Controller.findOne).put(staff ,Controller.update);
