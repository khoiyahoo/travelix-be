import { EBillStatus, EPaymentStatus } from "models/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { RoomBillDetailAttributes } from "./roomBillDetails";

export interface RoomBillAttributes extends Model {
  dataValues: any;
  id: number;
  userId: number;
  stayId: number;
  stayOwnerId: number;
  staffId: number;
  startDate: string;
  endDate: string;
  email: string;
  phoneNumber: string;
  fistName: string;
  lastName: string;
  price: number;
  discount: number;
  totalBill: number;
  commissionRate: number;
  commission: number;
  paymentStatus: EPaymentStatus;
  status: EBillStatus;
  expiredDate: Date;
  oldBillId: number;
  extraPay: number;
  moneyRefund: number;
  isRefunded: boolean;
  roomBillDetail: RoomBillDetailAttributes[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type RoomBillsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomBillAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomBillsInstance => {
  const room_bills = <RoomBillsInstance>sequelize.define(
    "room_bills",
    {
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      stayId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      stayOwnerId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      staffId: {
        type: DataTypes.INTEGER,
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      phoneNumber: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      discount: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      totalBill: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      commissionRate: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      commission: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      paymentStatus: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      status: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      oldBillId: {
        type: DataTypes.INTEGER,
      },
      extraPay: {
        type: DataTypes.DOUBLE,
      },
      moneyRefund: {
        type: DataTypes.DOUBLE,
      },
      isRefunded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expiredDate: {
          type: DataTypes.DATE,
      },
      stayData: {
        type: DataTypes.TEXT({ length: "long" }),
        allowNull: false,
        get() {
          return JSON.parse(this.getDataValue("stayData") || "{}");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(value: any) {
          this.setDataValue("stayData", JSON.stringify(value || {}));
        },
      },
    },
    {
      paranoid: true,
    }
  );
  room_bills.associate = (models: { [key: string]: any }) => {
    room_bills.belongsTo(models.users, {
      as: 'userInfo',
      foreignKey: 'userId',
      constraints: false
    });
    room_bills.belongsTo(models.users, {
      as: 'staffInfo',
      foreignKey: 'staffId',
      constraints: false
    });
    room_bills.belongsTo(models.stays, {
      as: 'stayInfo',
      foreignKey: 'stayId',
      constraints: false
    });
    // room_bills.belongsTo(models.hotels, {
    //   as: 'hotelInfo',
    //   foreignKey: 'hotelId',
    //   constraints: false
    // });
    room_bills.hasMany(models.room_bill_details, {
      as: 'roomBillDetail',
      foreignKey: 'billId',
      constraints: false
    });
    room_bills.belongsTo(models.room_bills, {
      as: "oldBillData",
      foreignKey: "oldBillId",
      constraints: false,
    });
  };
  return room_bills;
};
