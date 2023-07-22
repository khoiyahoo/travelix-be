export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface Create {
  tourId: number;
  tourOnSaleId: number;
  amountChild: number;
  amountAdult: number;
  price: number;
  discount: number;
  totalBill: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export interface CheckoutPayload {
  amount: number,
  orderId: string,
  clientIp: string,
}

export interface IParticipantInfo {
  fullName: string;
  phoneNumber: string;
}

export interface Update {
  paymentStatus: number;
  participantsInfo: IParticipantInfo[];
}

export interface ReSchedule {
  tourId: number;
  tourOnSaleId: number;
  amountChild: number;
  amountAdult: number;
  price: number;
  moneyRefund: number;
  extraPay: number;
  discount: number;
  totalBill: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
}

export interface Cancel {
  moneyRefund: number;
}

export enum EVNPayStatus {
  CREATE = 0,
  SUCCESS,
  FAIL
}

// export interface ICreateTourBill {
//   userId: number;
//   userMail: string;
//   tourId: number;
//   amount: number;
//   price: number;
//   discount: number;
//   email: string;
//   phoneNumber: string;
//   firstName: string;
//   lastName: string;
//   bankName: string;
//   bankAccountName: string;
//   bankNumber: string;
//   accountExpirationDate: Date;
//   deposit: number;
// }

// export interface IVerifyBookTour {
//   code: string;
//   billId: number;
// }

// export interface IGetToursRevenueByMonth {
//   tourIds: number[];
//   month: number;
//   year: number;
// }

// export interface IGetToursRevenueByYear {
//   tourIds: number[];
//   year: number;
// }

// export interface IGetAllTourBillsAnyDate {
//   tourIds: number[];
//   date: Date;
// }