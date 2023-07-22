import { Router } from "express";
import Controller from "./stay.controller";

export const router = Router();

router.route("/").get(Controller.findAll);
router.route("/:id").get(Controller.findOne);
