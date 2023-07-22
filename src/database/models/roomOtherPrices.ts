/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface RoomOtherPriceAttributes extends Model {
  dataValues: any;
  id: number;
  date: Date;
  price: number;
  roomId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type RoomOtherPricesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomOtherPriceAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomOtherPricesInstance => {
  const room_other_prices = <RoomOtherPricesInstance>sequelize.define(
    "room_other_prices",
    {
      date: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      price: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      roomId: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
  room_other_prices.associate = (models: { [key: string]: any }) => {
    room_other_prices.belongsTo(models.rooms, {
      as: 'roomInfo',
      foreignKey: 'roomId',
      constraints: false
    });
  };
  return room_other_prices;
};
