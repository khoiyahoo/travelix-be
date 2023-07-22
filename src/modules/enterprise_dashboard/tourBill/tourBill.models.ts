export interface Filter {
  isPast: boolean
}

export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
  tourId: number;         // tourId === -1  --> All
  tourOnSaleIds: number[];// [-1] --> All
  status: number;         // status === -1  --> All    -   EBillStatus
}

export interface Update {
  status: number;
}

export interface StatisticAll {
  take: number;
  page: number;
  keyword?: string;
  month: number;
  year: number;
}

export interface StatisticOneTour {
  take: number;
  page: number;
  month: number;
  year: number;
}

export interface StatisticTourOnSale {
  take: number;
  page: number;
}

export interface StaffStatisticTourOnSales {
  take: number;
  page: number;
  isPast: boolean;
  tourId: number;   // tourId === -1  --> All
}

export interface FindAllStaffBill {
  take: number;
  page: number;
  month: number;
  year: number;
  tourId: number;         // tourId === -1  --> All
  status: number;         // status === -1  --> All    -   EBillStatus
}