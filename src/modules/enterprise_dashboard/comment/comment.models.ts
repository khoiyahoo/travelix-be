export interface FindAll {
  serviceId: number;
  serviceType: number;
  rate: number;       // rate = -1  --> All
  take: number;
  page: number;
  keyword?: string;
}
