import Container from "typedi";
import { Request, Response } from "express";
import TourCommentService from "./tourComment.service";
import TourCommentValidation from "./tourComment.validation";

export default class TourCommentController {
  static getTourComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.getTourComments(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getAllTourComments(req: Request, res: Response) {
    try {
      const value = TourCommentValidation.getAllTourComments(req);
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.getAllTourComments(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static getTourCommentsNeedDelete(req: Request, res: Response) {
    try {
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.getTourCommentsNeedDelete(res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static createNewTourComment(req: Request, res: Response) {
    try {
      const value = TourCommentValidation.createNewTourComment(req);
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.createNewTourComment(value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static updateTourComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourCommentValidation.updateTourComment(req);
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.updateTourComment(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static replyTourComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourCommentValidation.replyTourComment(req);
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.replyTourComment(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static requestDeleteTourComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourCommentValidation.requestDeleteTourComment(req);
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.requestDeleteTourComment(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
  
  static declineDeleteTourComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const value = TourCommentValidation.declineDeleteTourComment(req);
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.declineDeleteTourComment(Number(id), value, res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }

  static deleteTourComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const TourCommentServiceI = Container.get(TourCommentService);
      TourCommentServiceI.deleteTourComment(Number(id), res);
    } catch (error) {
      return res.onError({
        detail: error,
      });
    }
  }
}
