/* eslint-disable @typescript-eslint/no-explicit-any */
import { EBillStatus, EPaymentStatus } from "models/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { RoomAttributes } from "./rooms";

export interface RoomBillDetailAttributes extends Model {
  dataValues: any;
  id: number;
  billId: number;
  roomId: number;
  stayId: number;
  stayOwnerId: number;
  amount: number;
  price: number;
  bookedDate: Date;
  commission: number;
  paymentStatus: EPaymentStatus;
  status: EBillStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  belongsToRoom: any;
  roomInfo: RoomAttributes;
}

export type RoomBillDetailsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomBillDetailAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomBillDetailsInstance => {
  const room_bill_details = <RoomBillDetailsInstance>sequelize.define(
    "room_bill_details",
    {
      billId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      roomId: {
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
      amount: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      price: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      bookedDate: {
        allowNull: false,
        type: DataTypes.STRING,
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
      roomData: {
        type: DataTypes.TEXT({ length: "long" }),
        allowNull: false,
        get() {
          return JSON.parse(this.getDataValue("roomData") || "{}");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(value: any) {
          this.setDataValue("roomData", JSON.stringify(value || {}));
        },
      },
    },
    {
      paranoid: true,
    }
  );
  room_bill_details.associate = (models: { [key: string]: any }) => {
    room_bill_details.belongsTo(models.room_bills, {
      as: 'roomBillInfo',
      foreignKey: 'billId',
      constraints: false
    });
    room_bill_details.belongsTo(models.stays, {
      as: 'stayInfo',
      foreignKey: 'stayId',
      constraints: false
    });
    room_bill_details.belongsTo(models.rooms, {
      as: 'roomInfo',
      foreignKey: 'roomId',
      constraints: false
    });
    room_bill_details.belongsTo(models.users, {
      as: 'enterpriseInfo',
      foreignKey: 'stayOwnerId',
      constraints: false
    });
    // room_bill_details.belongsTo(models.rooms, {
    //   as: 'roomInfo',
    //   foreignKey: 'roomId',
    //   constraints: false
    // });
  };
  return room_bill_details;
};
