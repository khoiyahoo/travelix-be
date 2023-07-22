/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface CheckRoomAttributes extends Model {
  dataValues: any;
  id: number;
  bookedDate: Date;
  numberOfRoomsAvailable: number;
  stayId: number;
  roomId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type CheckRoomsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): CheckRoomAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): CheckRoomsInstance => {
  const check_rooms = <CheckRoomsInstance>sequelize.define(
    "check_rooms",
    {
      bookedDate: {
        type: DataTypes.DATE,
      },
      numberOfRoomsAvailable: {
        type: DataTypes.INTEGER,
      },
      stayId: {
        type: DataTypes.INTEGER,
      },
      roomId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      paranoid: true,
    }
  );
  check_rooms.associate = (models: { [key: string]: any }) => {
    check_rooms.belongsTo(models.rooms, {
      as: 'belongToRoom',
      foreignKey: 'roomId',
      constraints: false
    });
  };
  return check_rooms;
};
