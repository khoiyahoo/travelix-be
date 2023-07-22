export interface FindAll {
  serviceId: number;
  serviceType: number;
  take: number;
  page: number;
  keyword?: string;
}

export interface Create {
  content: string;
  rate: number;
  serviceId: number;
  serviceType: number;
  billId: number;
}

export interface Update {
  content: string;
  rate: number;
  images: string[];         // mảng url image cũ
  imagesDeleted: string[];  // mảng url image bị xóa
}

export interface Reply {
  commentId: number;
  content: string;
}

export interface UpdateReply {
  content: string;
}
