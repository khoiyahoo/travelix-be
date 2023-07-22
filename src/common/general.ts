export enum NODE_ENV {
  DEVELOPMENT = "development",
  TEST = "test",
  PRODUCTION = "production",
}

export enum SEQUELIZE_SYNC {
  NO = "no",
  ALTER = "alter",
  FORCE = "force",
}

export enum ETypeUser {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  ENTERPRISE = 3,
  STAFF = 4,
  USER = 5,
}

export enum ETypeVerifyCode {
  VERIFY_EMAIL = 1,
  RESET_PASSWORD = 2,
  FORGOT_PASSWORD = 3,
  OFFER_STAFF = 4,
}

export enum LANG {
  VI = 'vi',
  EN = 'en'
}

export enum AttachmentObjectTypeId {
  PROJECT_REPORT = 1,
  PROJECT_INVOICE_DEMO = 2,
  SOLUTION_HOW_TO_SET_UP = 3,
  CONFIG = 4,
  VIDEO = 5
}

export enum EServiceType {
  TOUR = 1,
  HOTEL = 2
}

export enum EServicePolicyType {
  RESCHEDULE = 1,
  REFUND = 2
}

export enum EDiscountType {
  MONEY = 1,
  PERCENT = 2
}

export enum EBankType {
  DOMESTIC = 1,
  INTERNATIONAL = 2
}