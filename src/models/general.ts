export enum NODE_ENV {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production'
}

export enum SEQUELIZE_SYNC {
  NO = 'no',
  ALTER = 'alter',
  FORCE = 'force',
}

export enum EAdminType {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  USER = 3
}

export enum EUserStatus {
  ACTIVE = 1,
  SUSPEND = 0
}

export enum ETypeVerifyCode {
  VERIFY_EMAIL = 1,
  RESET_PASSWORD = 2
}

export enum SocialProvider {
  FACEBOOK = 'Facebook',
  ZALO = 'Zalo',
  GOOGLE = 'Google'
}

export enum AttachmentObjectTypeId {
  PROJECT_REPORT = 1,
  PROJECT_INVOICE_DEMO = 2,
  SOLUTION_HOW_TO_SET_UP = 3,
  CONFIG = 4,
  VIDEO = 5
}

export enum ProjectStatus {
  DRAFT = 1,
  AWAIT_PAYMENT,
  IN_PROGRESS,
  COMPLETED,
  CANCELED
}

export enum LANG {
  VI = 'vi',
  EN = 'en'
}

export enum USER_TIMEZONE {
  VI = "Asia/Ho_Chi_Minh"
}

export const langs: OptionItem[] = [
  { id: LANG.VI, name: "Tiếng Việt" },
  { id: LANG.EN, name: "English" },
]

export enum EGender {
  Female = 'Nu',
  Male = 'Nam'
}

export enum EPaymentMethod {
  CREDIT_OR_DEBIT = 1,
  INTERNET_BANKING = 2,
  BANK_TRANSFER = 3,
  MAKE_AN_ORDER = 4,
  ONEPAY_GENERAL = 5
}

export enum EPaymentStatus {
  NOT_PAID = 0,
  PAID,
  CANCEL,
  FAILED,
  EXPIRED
}

export enum EBillStatus {
  RESCHEDULED = 0,
  CANCELED,
  NOT_CONTACTED_YET,
  CONTACTED,
  USED,
  NOT_USE,
  WAITING_RESCHEDULE_SUCCESS,
}

export enum ECurrency {
  USD = 'USD',
  VND = 'VND',
}

export enum EOnePayStatus {
  CREATE = 0,
  SUCCESS,
  FAIL
}

export enum EStatus {
  Active = 1,
  Inactive,
  Coming_Soon
}

export interface OptionItem {
  id: number | string,
  name: string,
  translation?: string
}

export enum PackType {
  Current_Pack = 1,
  Test_Pack,
  Competitor_Pack,
}

export enum PackPosition {
  Normal = 1,
  Eye_Tracking = 2
}

export const packTypes: OptionItem[] = [
  { id: PackType.Current_Pack, name: 'Current pack', translation: 'setup_survey_pack_type_current_pack' },
  { id: PackType.Test_Pack, name: 'Test pack', translation: 'setup_survey_pack_type_test_pack' },
  { id: PackType.Competitor_Pack, name: 'Competitor pack', translation: 'setup_survey_pack_type_competitor_pack' },
]

export enum AttributeType {
  MANATORY = 1,
  PRE_DEFINED = 2
}

export const attributeTypes: OptionItem[] = [
  { id: AttributeType.MANATORY, name: 'Mandatory' },
  { id: AttributeType.PRE_DEFINED, name: 'Pre-defined' },
]

export enum TargetQuestionType {
  Location = 1,
  Household_Income,
  Gender_And_Age_Quotas,
  Mums_Only
}

export const targetQuestionTypes: OptionItem[] = [
  { id: TargetQuestionType.Location, name: 'Location' },
  { id: TargetQuestionType.Household_Income, name: 'Household income' },
  { id: TargetQuestionType.Gender_And_Age_Quotas, name: 'Gender and age quotas' },
  { id: TargetQuestionType.Mums_Only, name: 'Mums only' }
]

export enum TargetQuestionRenderType {
  Normal = 1,
  Box
}

export const targetQuestionRenderTypes: OptionItem[] = [
  { id: TargetQuestionRenderType.Normal, name: 'Normal' },
  { id: TargetQuestionRenderType.Box, name: 'Box' }
]

export enum ECustomQuestionType {
  Open_Question = 1,
  Single_Choice = 2,
  Multiple_Choices = 3,
  Numeric_Scale = 4,
  Smiley_Rating = 5,
  Star_Rating = 6,
}

export enum ESOLUTION_TYPE {
  PACK = 1,
  VIDEO_CHOICE = 2,
  BRAND_TRACKING = 3
}

export enum EOPERATION_TYPE {
  ADD = 1,
  SUBTRACT = 2
}

export enum EVIDEO_TYPE {
  UPLOAD = 1,
  YOUTUBE = 2
}

export enum EVIDEO_MARKETING_STAGE {
  POST_LAUNCH = 1,
  PRE_LAUNCH = 2
}

export const currencySymbol = {
  [ECurrency.USD]: {
    first: '$',
    last: ''
  },
  [ECurrency.VND]: {
    first: '',
    last: ' ₫'
  },
}

export enum BRAND_TYPE {
  MAIN = 1,
  COMPETING = 2
}

export const brandTypes: OptionItem[] = [
  { id: BRAND_TYPE.MAIN, name: 'Main' },
  { id: BRAND_TYPE.COMPETING, name: 'Competing' },
]

export enum EBRAND_ASSET_TYPE {
  IMAGE = 1,
  SLOGAN = 2,
  SOUND = 3
}
export enum AttributeContentType {
  SINGLE = 1,
  MULTIPLE = 2
}

export const attributeContentTypes: OptionItem[] = [
  { id: AttributeContentType.SINGLE, name: 'Single' },
  { id: AttributeContentType.MULTIPLE, name: 'Multiple' }
]

export enum EPAYMENT_SCHEDULE_STATUS {
  NOT_PAID = 0,
  IN_PROGRESS,
  PAID,
  OVERDUE,
  CANCEL
}

export const NUMBER_OF_PAYMENT_SCHEDULES = 4

export enum EPaymentScheduleCancelType {
  NOT_CANCEL = 0,
  AUTO_CANCEL,
  USER_CANCEL
}

export enum ESortOption {
  LOWEST_PRICE = 0,
  HIGHEST_PRICE,
  HIGHEST_RATE,
}

export enum StayType {
  HOTEL = 1,
  HOMESTAY,
  RESORT,
}

export interface IBankInfo {
  id: number;
  name: string;
}

export enum ESortStaffRevenueOption {
  LOWEST_BILL = 0,
  HIGHEST_BILL,
  LOWEST_REVENUE,
  HIGHEST_REVENUE,
}