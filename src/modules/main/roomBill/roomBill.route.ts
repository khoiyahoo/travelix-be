import { Router } from "express";
import Controller from "./roomBill.controller";
import { auth } from "middlewares";

export const router = Router();

router.route("/").get(auth, Controller.findAll).post(auth ,Controller.create);
router.route("/:id").get(auth, Controller.findOne).put(auth ,Controller.update);
router.route("/re-schedule/:id").put(auth ,Controller.reSchedule);
router.route("/latest/:stayId").get(auth, Controller.findLatest);
router.route("/cancel/:id").put(auth ,Controller.cancel);

// router.route("/get-room-bill/:billId").get(RoomBillController.getRoomBill);
// router.route("/get-room-bill-details/:billId").get(RoomBillController.getRoomBillDetails);
// router.route("/get-all-room-bills/:roomId").get(RoomBillController.getAllRoomBills);
// router.route("/get-room-bills-any-date").post(RoomBillController.getAllRoomBillsAnyDate);
// router.route("/get-all-user-room-bills/:userId").get(RoomBillController.getAllUserRoomBills);
// router.route("/create").post(RoomBillController.createRoomBill);
// router.route("/cancel-room-bill/:billId").put(RoomBillController.cancelRoomBill);
// router.route("/verify-book-room").post(RoomBillController.verifyBookRoom);
// router.route("/get-hotels-revenue-by-month").post(RoomBillController.getRevenueOfHotelsByMonth);
// router.route("/get-hotels-revenue-by-year").post(RoomBillController.getRevenueOfHotelsByYear);
