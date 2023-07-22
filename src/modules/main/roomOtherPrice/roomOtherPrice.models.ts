export interface IGetPrice {
  date: Date;
  roomId: number;
}

export interface ICreateRoomOtherPrice {
  date: Date;
  price: number;
  roomId: number;
}

export interface IUpdateRoomOtherPrice {
  date: Date;
  price: number;
  roomId: number;
}

export interface IDeletePrice {
  date: Date;
  roomId: number;
}
