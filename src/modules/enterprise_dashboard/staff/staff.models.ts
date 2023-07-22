import { ETypeUser } from "common/general";

export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface SendOffer {
  email: string;
}

export interface ChangeRole {
  userId: number;
  role: ETypeUser;
}

export interface StatisticTourBill {
  take: number;
  page: number;
  month: number;
  year: number;
  sort: number;    //ESortStaffRevenueOption
}

export interface StatisticRoomBill {
  take: number;
  page: number;
  month: number;
  year: number;
  sort: number;    //ESortStaffRevenueOption
}