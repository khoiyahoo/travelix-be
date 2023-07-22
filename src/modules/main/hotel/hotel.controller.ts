// import Container from "typedi";
// import HotelService from "./hotel.service";
// import HotelValidation from "./hotel.validation";
// import { Request, Response } from "express";

// export default class HotelController {
//   static getHotel(req: Request, res: Response) {
//     try {
//       const { hotelId } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.getHotel( Number(hotelId), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static getHotels(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.getHotels(Number(id), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static getAllHotels(req: Request, res: Response) {
//     try {
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.getAllHotels(res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static getAllHotelsByPage(req: Request, res: Response) {
//     try {
//       const { page } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.getAllHotelsByPage(Number(page), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static createNewHotel(req: Request, res: Response) {
//     try {
//       const value = HotelValidation.createNewHotel(req);
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.createNewHotel(value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static updateHotel(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const value = HotelValidation.updateHotel(req);
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.updateHotel(Number(id), value, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
  
//   static temporarilyStopWorking(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.temporarilyStopWorking(Number(id), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
  
//   static workAgain(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.workAgain(Number(id), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static deleteHotel(req: Request, res: Response) {
//     try {
//       const { id } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.deleteHotel(Number(id), res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static searchHotels(req: Request, res: Response) {
//     try {
//       const { name } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.searchHotel(name, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
  
//   static searchByLocation(req: Request, res: Response) {
//     try {
//       const { location } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.searchByLocation(location, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }

//   static searchHotelsOfEnterprise(req: Request, res: Response) {
//     try {
//       const { userId, name } = req.params;
//       const HotelServiceI = Container.get(HotelService);
//       HotelServiceI.searchHotelOfEnterprise(Number(userId), name, res);
//     } catch (error) {
//       return res.onError({
//         detail: error,
//       });
//     }
//   }
// }
