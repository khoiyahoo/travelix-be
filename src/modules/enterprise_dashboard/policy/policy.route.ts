import { Router } from "express";
import { staff } from "middlewares";
import Controller from "./policy.controller";

export const router = Router();

router.route("/").get(staff, Controller.findAll).put(staff, Controller.createOrUpdate);

router.route("/:id").delete(staff, Controller.delete);
