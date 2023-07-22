import { EServicePolicyType, EServiceType } from "common/general";

export interface FindAll {
  serviceId: number;
  serviceType: EServiceType;
}

export interface CreateOrUpdate {
  id?: number;
  serviceId: number;
  serviceType: EServiceType;
  policyType: EServicePolicyType;
  dayRange: number;
  moneyRate: number;
}
