export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
  stayId: number;
  roomId?: number;        // null --> All
  date?: Date;            // null --> All
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

export interface StatisticOneStay {
  take: number;
  page: number;
  month: number;
  year: number;
}

export interface StatisticRoom {
  month: number;
  year: number;
}

export interface FindAllStaffBill {
  take: number;
  page: number;
  stayId: number;
  month: number;
  year: number;
  status: number;         // status === -1  --> All    -   EBillStatus
}
