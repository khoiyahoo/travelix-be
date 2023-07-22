import { Router } from "express";
import Controller from "./event.controller";

export const router = Router();

router.route("/").get(Controller.findAll);

router.route("/:id").get(Controller.findOne);

router.route("/match/:code").get(Controller.findByCode);
