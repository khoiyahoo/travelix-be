export enum ERoomStatusFilter {
  ALL = -1,
  ACTIVED = 0,
  IN_ACTIVED = 1,
}

export interface FindAll {
  stayId: number;
  take: number;
  page: number;
  keyword?: string;
  status: ERoomStatusFilter;
}

export interface FindOne {
  stayId: number;
  language?: string;
}

export interface Create {
  title: string;
  description: string;
  utility: string[];
  numberOfAdult: number;
  numberOfChildren: number;
  numberOfBed: number;
  numberOfRoom: number;
  discount: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
  stayId: number;
}

export interface Update {
  title: string;
  description: string;
  utility: string[];
  numberOfAdult: number;
  numberOfChildren: number;
  numberOfBed: number;
  numberOfRoom: number;
  discount: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
  language: string;
  images: string[];         // mảng url image cũ
  imagesDeleted: string[];  // mảng url image bị xóa
}                           // image add mới thì gửi append file theo formData giống như lúc create
            // ví dụ ban đầu có 5 image: [1, 2, 3, 4, 5] và xóa đi image 2 và 4 thì:
            // field images: [1, 3, 5]
            // field imagesDeleted: [2, 4]

            
export interface CreateOrUpdateCheckRoom {
  date: Date;
  amount: number;
  stayId: number;
  roomId: number;
}