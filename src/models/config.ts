import { EOPERATION_TYPE } from "models/general";
export interface Config {
  usdToVND: number,
  vat: number,
  viewContract: number,
}

export enum ConfigType {
  number = 'number',
  attachment = 'attachment'
}

export interface PaymentScheduleConfig {
  daysOfDueDate: number,
  daysOfDueDateType: EOPERATION_TYPE,
  paymentMonthSchedule: number,
}