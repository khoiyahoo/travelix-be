export interface FindAll {
  take: number;
  page: number;
  stayId: number;
  startDate: Date;
  endDate: Date;
  numberOfAdult?: number;
  numberOfChildren?: number;
  numberOfRoom?: number;
  sort?: number;    //ESortOption
}

// export interface ICreateRoom {
//   title: string;
//   description: string;
//   discount: number;
//   tags: string;
//   images: string;
//   numberOfBed: number;
//   numberOfRoom: number;
//   mondayPrice: number;
//   tuesdayPrice: number;
//   wednesdayPrice: number;
//   thursdayPrice: number;
//   fridayPrice: number;
//   saturdayPrice: number;
//   sundayPrice: number;
//   hotelId: number;
// }

// export interface IUpdateRoomInfo {
//   title: string;
//   description: string;
//   tags: string;
//   images: string;
//   numberOfBed: number;
//   numberOfRoom: number;
// }

// export interface IUpdateRoomPrice {
//   discount: number;
//   mondayPrice: number;
//   tuesdayPrice: number;
//   wednesdayPrice: number;
//   thursdayPrice: number;
//   fridayPrice: number;
//   saturdayPrice: number;
//   sundayPrice: number;
// }

// export interface IGetRoomsAvailable {
//   hotelId: number;
//   startDate: Date;
//   endDate: Date;
// }
