import database from "database/models";
import { Container } from "typedi";

export default () => {
  Container.set('attachmentsModel', database.attachments);
  Container.set('configsModel', database.configs);
  Container.set("usersModel", database.users);
  Container.set("verifyCodesModel", database.verify_codes);
  Container.set("toursModel", database.tours);
  Container.set("tourBillsModel", database.tour_bills);
  Container.set("staysModel", database.stays);
  Container.set("stayRevenuesModel", database.stay_revenues);
  Container.set("roomsModel", database.rooms);
  Container.set("roomBillsModel", database.room_bills);
  Container.set("roomBillDetailsModel", database.room_bill_details);
  Container.set("roomOtherPricesModel", database.room_other_prices);
  Container.set("checkRoomsModel", database.check_rooms);
  Container.set('translationsModel', database.translations);
  Container.set("tourCommentsModel", database.tour_comments);
  Container.set("tourOnSalesModel", database.tour_on_sales);
  Container.set("tourPricesModel", database.tour_prices);
  Container.set("tourSchedulesModel", database.tour_schedules);
  Container.set("eventsModel", database.events);
  Container.set("hotelCommentsModel", database.hotel_comments);
  Container.set("policiesModel", database.policies);
  Container.set("vnPaysModel", database.vnpays);
  Container.set("commentsModel", database.comments);
  Container.set("commissionsModel", database.commissions);
};
