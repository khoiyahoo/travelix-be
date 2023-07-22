import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface VNPayAttributes extends Model {
  id: number;
  userPaymentId: number;
  amount: string;
  status: number;
  paymentMethodId: number;
  module: string;
  rawCheckout: string;
  rawCallback: string;
  vpc_MerchTxnRef: string;
  vpc_OrderInfo: string;
  vpc_TicketNo: string;
  vpc_TxnResponseCode: string;
  vpc_TransactionNo: string;
  message: string;
  completedDate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type VNPaysInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): VNPayAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): VNPaysInstance => {
  const vnpays = <VNPaysInstance>sequelize.define(
    "vnpays",
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      checkInTime: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      checkOutTime: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      location: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      contact: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tags: {
        type: DataTypes.STRING,
      },
      images: {
        type: DataTypes.STRING,
      },
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      rate: {
        defaultValue: 0,
        type: DataTypes.DOUBLE,
      },
      numberOfReviewer: {
        defaultValue: 0,
        type: DataTypes.INTEGER,
      },
      isTemporarilyStopWorking: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vnpays.associate = (models: { [key: string]: any }) => {
    vnpays.belongsTo(models.users, {
      as: 'belongToUser',
      foreignKey: 'creator',
      constraints: false
    });
    vnpays.hasMany(models.rooms, {
      as: 'hasManyRooms',
      foreignKey: 'hotelId',
      constraints: false
    });
  };
  return vnpays;
};
