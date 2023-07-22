export interface Create {
  tourOnSaleId: number;
  title: string;
  minOld: number;
  maxOld: number;
  price: number;
}

export interface Update {
  title: string;
  minOld: number;
  maxOld: number;
  price: number;
}