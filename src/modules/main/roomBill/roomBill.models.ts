export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface Create {
  stayId: number;
  rooms: {
    roomId: number;
    amount: number;
    price: number;
    discount: number;   //percent
    bookedDate: Date;
  }[];
  startDate: Date;
  endDate: Date;
  price: number;
  discount: number;     //money
  totalBill: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export interface ReSchedule {
  stayId: number;
  rooms: {
    roomId: number;
    amount: number;
    price: number;
    discount: number;   //percent
    bookedDate: Date;
  }[];
  startDate: Date;
  endDate: Date;
  price: number;
  discount: number;     //money
  totalBill: number;
  moneyRefund: number;
  extraPay: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export interface Update {
  paymentStatus: number;
}

export interface ICreateRoomBill {
  userId: number;
  hotelId: number;
  userMail: string;
  rooms: {
    roomId: string;
    amount: string;
    title: string;
    discount: number;
    price: number;
    bookedDate?: Date;
    totalPrice: number;
  }[];
  bookedDates: string;
  startDate: Date;
  endDate: Date;
  totalBill: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  bankName: string;
  bankAccountName: string;
  bankNumber: string;
  accountExpirationDate: Date;
  deposit: number;
}

export interface IVerifyBookRoom {
  code: string;
  billId: number;
}

export interface IGetHotelsRevenueByMonth {
  hotelIds: number[];
  month: number;
  year: number;
}

export interface IGetHotelsRevenueByYear {
  hotelIds: number[];
  year: number;
}

export interface IGetBillsAnyRoom {
  hotelId: string;
  date: Date;
}

export interface Cancel {
  moneyRefund: number;
}