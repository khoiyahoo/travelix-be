import { Router } from "express";
import TourController from "./tour.controller";

export const tourRouter = Router();

tourRouter.route("/").get(TourController.findAll);
tourRouter.route("/:id").get(TourController.findOne);




// tourRouter.route("/get-tours/:id").get(TourController.getTours);
// tourRouter.route("/get-tour/:tourId").get(TourController.getTour);
// tourRouter.route("/get-all-tours").get(TourController.getAllTours);
// tourRouter.route("/get-all-tours-by-page/:page").get(TourController.getAllToursByPage);
// tourRouter.route("/create").post(TourController.createNewTour);
// tourRouter.route("/update/:id").put(TourController.updateTour);
// tourRouter.route("/delete/:id").put(TourController.deleteTour);
// tourRouter.route("/temporarily-stop-working/:id").put(TourController.temporarilyStopWorking);
// tourRouter.route("/work-again/:id").put(TourController.workAgain);
// tourRouter.route("/search-tours/:name").get(TourController.searchTours);
// tourRouter.route("/search-by-location/:location").get(TourController.searchByLocation);
// tourRouter.route("/enterprise-search-tours/user/:userId/tour/:name").get(TourController.searchToursOfEnterprise);
