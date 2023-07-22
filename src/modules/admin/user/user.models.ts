import { ETypeUser } from "common/general";

export interface FindAll {
  take: number;
  page: number;
  keyword?: string;
}

export interface ChangeRole {
  userId: number;
  role: ETypeUser;
}