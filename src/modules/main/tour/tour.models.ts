export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
  dateSearch?: Date;
  sort?: number;    //ESortOption
}

export interface ITour {
  title: string;
  description: string;
  businessHours: string;
  location: string;
  contact: string;
  price: number;
  discount: number;
  tags: string;
  images: string;
  creator: number;
}

export interface IUpdateTour {
  title: string;
  description: string;
  businessHours: string;
  location: string;
  contact: string;
  price: number;
  discount: number;
  tags: string;
  images: string;
}
