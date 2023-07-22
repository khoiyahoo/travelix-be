import { EDiscountType } from "common/general";

export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
  owner: number;
  serviceType: number;  //EServiceType
  serviceId: number;
}