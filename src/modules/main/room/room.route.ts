import { Router } from "express";
import Controller from "./room.controller";

export const router = Router();

router.route("/").get(Controller.findAll);
// router.route("/get-room/:roomId").get(RoomController.getRoom);
// router.route("/get-rooms-available").post(RoomController.getRoomsAvailable);
// router.route("/get-all-rooms/:hotelId").get(RoomController.getAllRoomsOfHotel);
// router.route("/create").post(RoomController.createNewRoom);
// router.route("/update-information/:id").put(RoomController.updateRoomInformation);
// router.route("/update-price/:id").put(RoomController.updateRoomPrice);
// router.route("/delete/:id").put(RoomController.deleteRoom);
// router.route("/temporarily-stop-working/:id").put(RoomController.temporarilyStopWorking);
// router.route("/work-again/:id").put(RoomController.workAgain);
