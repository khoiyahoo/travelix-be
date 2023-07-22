import { Router } from "express";
import Controller from "./translation.controller";

export const router = Router();

router
  .route('/:lng/:ns')
  .get(Controller.findAll)

router
  .route('/sync-from-db')
  .get(Controller.syncFromDB)

  