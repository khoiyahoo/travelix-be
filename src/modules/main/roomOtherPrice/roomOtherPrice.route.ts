import { Router } from "express";
import RoomOtherPriceController from "./roomOtherPrice.controller";

export const roomOtherPriceRouter = Router();

roomOtherPriceRouter.route("/get-price").get(RoomOtherPriceController.getPrice);
roomOtherPriceRouter.route("/get-all-prices/:id").get(RoomOtherPriceController.getAllPrices);
roomOtherPriceRouter.route("/create").post(RoomOtherPriceController.createNewPrice);
roomOtherPriceRouter.route("/update/:id").put(RoomOtherPriceController.updatePrice);
roomOtherPriceRouter.route("/delete/:id").put(RoomOtherPriceController.deletePrice);
