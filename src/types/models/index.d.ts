import { AttachmentAttributes, AttachmentsInstance } from "database/models/attachments";
import { CheckRoomAttributes, CheckRoomsInstance } from "database/models/checkRooms";
import { CommentAttributes, CommentsInstance } from "database/models/comments";
import { commissionsInstance, commissionAttributes } from "database/models/commission";
import { ConfigAttributes, ConfigsInstance } from "database/models/configs";
import { EventAttributes, EventsInstance } from "database/models/events";
import { HotelCommentAttributes, HotelCommentsInstance } from "database/models/hotelComments";
import { StayAttributes, StaysInstance } from "database/models/stays";
import { policiesInstance, policyAttributes } from "database/models/policies";
import { RoomBillDetailAttributes, RoomBillDetailsInstance } from "database/models/roomBillDetails";
import { RoomBillAttributes, RoomBillsInstance } from "database/models/roomBills";
import { RoomOtherPriceAttributes, RoomOtherPricesInstance } from "database/models/roomOtherPrices";
import { RoomAttributes, RoomsInstance } from "database/models/rooms";
import { TourBillAttributes, TourBillsInstance } from "database/models/tourBills";
import { TourCommentAttributes, TourCommentsInstance } from "database/models/tourComments";
import { TourOnSaleAttributes, TourOnSalesInstance } from "database/models/tourOnSales";
import { TourPriceAttributes, TourPricesInstance } from "database/models/tourPrices";
import { TourAttributes, ToursInstance } from "database/models/tours";
import { TourScheduleAttributes, TourSchedulesInstance } from "database/models/tourSchedules";
import { TranslationAttributes, TranslationsInstance } from "database/models/translations";
import { UserAttributes, UsersInstance } from "database/models/users";
import { VerifyCodeAttributes, VerifyCodesInstance } from "database/models/verifyCodes";
import { VNPayAttributes, VNPaysInstance } from "database/models/vnpays";
import { StayRevenueAttributes, StayRevenuesInstance } from "database/models/stayRevenues";

declare global {
  namespace ModelsAttributes {
    export type Attachment = AttachmentAttributes;
    export type User = UserAttributes;
    export type Config = ConfigAttributes
    export type Comment = CommentAttributes
    export type VerifyCode = VerifyCodeAttributes;
    export type Tour = TourAttributes;
    export type Stay = StayAttributes;
    export type StayRevenue = StayRevenueAttributes;
    export type Room = RoomAttributes;
    export type CheckRoom = CheckRoomAttributes;
    export type RoomOtherPrice = RoomOtherPriceAttributes;
    export type RoomBill = RoomBillAttributes;
    export type RoomBillDetail = RoomBillDetailAttributes;
    export type Translation = TranslationAttributes;
    export type TourBill = TourBillAttributes;
    export type TourComment = TourCommentAttributes;
    export type TourOnSale = TourOnSaleAttributes;
    export type TourPrice = TourPriceAttributes;
    export type TourSchedule = TourScheduleAttributes;
    export type Event = EventAttributes;
    export type HotelComment = HotelCommentAttributes;
    export type Policy = policyAttributes;
    export type CommissionPolicy = commissionAttributes;
    export type VNPay = VNPayAttributes;
  }

  namespace ModelsInstance {
    export type Attachments = AttachmentsInstance;
    export type Users = UsersInstance;
    export type Configs = ConfigsInstance
    export type Comments = CommentsInstance
    export type VerifyCodes = VerifyCodesInstance;
    export type Tours = ToursInstance;
    export type Stays = StaysInstance;
    export type StayRevenues = StayRevenuesInstance;
    export type Rooms = RoomsInstance;
    export type CheckRooms = CheckRoomsInstance;
    export type RoomOtherPrices = RoomOtherPricesInstance;
    export type RoomBills = RoomBillsInstance;
    export type RoomBillDetails = RoomBillDetailsInstance;
    export type Translations = TranslationsInstance;
    export type TourBills = TourBillsInstance;
    export type TourComments = TourCommentsInstance;
    export type TourOnSales = TourOnSalesInstance;
    export type TourPrices = TourPricesInstance;
    export type TourSchedules = TourSchedulesInstance;
    export type Events = EventsInstance;
    export type HotelComments = HotelCommentsInstance;
    export type Policies = policiesInstance;
    export type Commissions = commissionsInstance;
    export type VNPays = VNPaysInstance;
  }
}
