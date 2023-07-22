import { Router } from "express";
import { admin } from "middlewares";
import Controller from "./tour_on_sale.controller";

export const router = Router();

router.route("/:id").put(admin, Controller.updateReceivedRevenue);
