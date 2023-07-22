import Container from "typedi";
import TourBillService from "./tourBill.service";
import TourBillValidation from "./tourBill.validation";
import { Request, Response } from "express";

export default class UserController {
  static create(req: Request, res: Response) {
    try {
      const value = TourBillValidation.create(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.create(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.update(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.update(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static againLink(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.againLink(Number(id), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findAll(req: Request, res: Response) {
    try {
      const value = TourBillValidation.findAll(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findAll(value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findOne(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static findLatest(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.findLatest(Number(tourId), req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static reSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.reSchedule(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.reSchedule(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourBillValidation.cancel(req);
      const TourBillServiceI = Container.get(TourBillService);
      TourBillServiceI.cancel(Number(id), value, req.user, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  // static getTourBill(req: Request, res: Response) {
  //   try {
  //     const { billId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getTourBill(Number(billId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getAllTourBills(req: Request, res: Response) {
  //   try {
  //     const { tourId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getAllTourBills(Number(tourId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getAllUserTourBills(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getAllUserTourBills(Number(userId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getAllTourBillsAnyDate(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.getAllTourBillsAnyDate(req);
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.getAllTourBillsAnyDate(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static createTourBill(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.createTourBill(req);
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.createTourBill(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static verifyBookTour(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.verifyBookTour(req);
  //     const VerifyCodeI = Container.get(TourBillService);
  //     VerifyCodeI.verifyBookTour(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getRevenueOfToursByMonth(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.getRevenueOfToursByMonth(req);
  //     const VerifyCodeI = Container.get(TourBillService);
  //     VerifyCodeI.getRevenueOfToursByMonth(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static getRevenueOfToursByYear(req: Request, res: Response) {
  //   try {
  //     const value = TourBillValidation.getRevenueOfToursByYear(req);
  //     const VerifyCodeI = Container.get(TourBillService);
  //     VerifyCodeI.getRevenueOfToursByYear(value, res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }

  // static cancelTourBill(req: Request, res: Response) {
  //   try {
  //     const { billId } = req.params;
  //     const TourBillServiceI = Container.get(TourBillService);
  //     TourBillServiceI.cancelTourBill(Number(billId), res);
  //   } catch (error) {
  //     return res.onError({
  //       detail: error,
  //     });
  //   }
  // }
}
