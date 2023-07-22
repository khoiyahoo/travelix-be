export interface FindAll {
  take: number;
  page: number;
  isPast: boolean;
}

export interface IRoomOtherPrice {
  id?: number;
  date: Date;
  price: number;
  roomId: number;
}
