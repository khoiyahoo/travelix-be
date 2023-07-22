export enum ESortRoomBillOption {
  LOWEST_REVENUE = 0,
  HIGHEST_REVENUE,
}

export interface StatisticAllUsers {
  take: number;
  page: number;
  month: number;
  year: number;
  keyword?: string;
  sort?: number; //ESortRoomBillOption
}

export interface StatisticOneUser {
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

export interface FindAllOrderNeedRefund {
  take: number;
  page: number;
  month: number;
  year: number;
  refundStatus: number;         // refundStatus === -1  --> All
}                               // refundStatus === 0   --> Not refunded yet
                                // refundStatus === 1   --> Refunded


export interface FindAllStayRevenue {
  take: number;
  page: number;
  keyword?: string; // stay name
  month: number;
  year: number;
  section: number; // 1, 2
  isReceivedRevenue: boolean;
}