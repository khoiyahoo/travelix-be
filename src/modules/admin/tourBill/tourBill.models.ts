export enum ESortTourBillOption {
  LOWEST_REVENUE = 0,
  HIGHEST_REVENUE,
}

export interface StatisticByUser {
  take: number;
  page: number;
  month: number;
  year: number;
  keyword?: string;
  sort?: number; //ESortTourBillOption
}

export interface StatisticByTour {
  take: number;
  page: number;
  month: number;
  year: number;
  keyword?: string;
}

export interface StatisticByTourOnSale {
  take: number;
  page: number;
  month: number;
  year: number;
}

export interface GetAllBillOfOneTourOnSale {
  take: number;
  page: number;
}

export interface FindAllOrderNeedRefund {
  take: number;
  page: number;
  month: number;
  year: number;
  refundStatus: number;         // refundStatus === -1  --> All
}                               // refundStatus === 0   --> Not refunded yet
                                // refundStatus === 1   --> Refunded

export interface StatisticAllTourOnSale {
  take: number;
  page: number;
  keyword?: string;
  month: number;
  year: number;
  isReceivedRevenue: boolean;
}