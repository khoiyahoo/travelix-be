import { Router } from "express";
import { auth, enterprise } from "middlewares";
import Controller from "./staff.controller";

export const router = Router();

router.route("/").get(enterprise, Controller.findAll);
router.route("/get-offers").get(enterprise, Controller.findAllOffers);
router.route("/statistic/tour-bill").get(enterprise, Controller.statisticTourBill);
router.route("/statistic/room-bill").get(enterprise, Controller.statisticRoomBill);
router.route("/send-offer").post(enterprise, Controller.sendOffer);
router.route("/accept-offer/:id").put(auth, Controller.acceptOffer);             // id ~ offerId
router.route("/cancel-offer/:id").delete(enterprise, Controller.cancelSendOffer);// id ~ offerId
router.route("/delete/:id").delete(enterprise, Controller.delete);               // id ~ staffId
