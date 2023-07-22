import { Router } from "express";
import TourBillController from "./tourBill.controller";
import { admin, superAdmin } from "middlewares";

export const tourBillRouter = Router();

tourBillRouter.route("/statistic").get(superAdmin, TourBillController.statisticByUser);
tourBillRouter.route("/statistic/tour/:id").get(superAdmin, TourBillController.statisticByTour);
tourBillRouter.route("/statistic/tour-on-sale").get(superAdmin, TourBillController.statisticAllTourOnSale);
tourBillRouter.route("/statistic/tour-on-sale/get-bills/:id").get(superAdmin, TourBillController.getAllBillOfOneTourOnSale);
tourBillRouter.route("/statistic/tour-on-sale/:id").get(superAdmin, TourBillController.statisticByTourOnSale);
tourBillRouter.route("/order-refund").get(admin, TourBillController.findAllOrderNeedRefund);
tourBillRouter.route("/order-refund/:id").put(admin, TourBillController.updateRefunded);
