import { Router } from "express";
import Controller from "./voucher.controller";

export const router = Router();

router.route("/").get(Controller.findAll);

router.route("/:id").get(Controller.findOne);
