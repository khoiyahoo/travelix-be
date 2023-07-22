/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { LANG } from "common/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface RoomAttributes extends Model {
  dataValues: any;
  id: number;
  title: string;
  description: string;
  utility: string[];
  stayId: number;
  images: string[];
  numberOfBed: number;
  numberOfRoom: number;
  numberOfAdult: number;
  numberOfChildren: number;
  discount: number;
  mondayPrice: number;
  tuesdayPrice: number;
  wednesdayPrice: number;
  thursdayPrice: number;
  fridayPrice: number;
  saturdayPrice: number;
  sundayPrice: number;
  isDeleted: boolean;
  parentLanguage: number;
  language: string;
  otherPrices: ModelsAttributes.RoomOtherPrice[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type RoomsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): RoomAttributes;
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): RoomsInstance => {
  const rooms = <RoomsInstance>sequelize.define(
    "rooms",
    {
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      discount: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      utility: {
        allowNull: false,
        type: DataTypes.TEXT,
        get() {
          return JSON.parse(this.getDataValue("utility") || "[]");
        },
        set(value: any) {
          this.setDataValue("utility", JSON.stringify(value || []));
        },
      },
      images: {
        type: DataTypes.TEXT({ length: "long" }),
        get() {
          return JSON.parse(this.getDataValue("images") || "[]");
        },
        set(value: any) {
          this.setDataValue("images", JSON.stringify(value || []));
        },
      },
      stayId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      numberOfAdult: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      numberOfChildren: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      numberOfBed: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      numberOfRoom: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      mondayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      tuesdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      wednesdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      thursdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      fridayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      saturdayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      sundayPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      isDeleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parentLanguage: {
        type: DataTypes.INTEGER,
      },
      language: {
        type: DataTypes.STRING,
        comment: `VietNam: ${LANG.VI}, English: ${LANG.EN}`,
      },
    },
    {
      paranoid: true,
    }
  );
  rooms.associate = (models: { [key: string]: any }) => {
    rooms.hasMany(models.rooms, {
      as: "languages",
      foreignKey: "parentLanguage",
      constraints: false,
    });
    rooms.belongsTo(models.stays, {
      as: 'stayInfo',
      foreignKey: 'stayId',
      constraints: false
    });
    rooms.hasMany(models.room_other_prices, {
      as: 'otherPrices',
      foreignKey: 'roomId',
      constraints: false
    });
    rooms.hasMany(models.check_rooms, {
      as: 'checkRooms',
      foreignKey: 'roomId',
      constraints: false
    });
    rooms.hasMany(models.room_bill_details, {
      as: 'roomBillDetail',
      foreignKey: 'roomId',
      constraints: false
    });
  };
  return rooms;
};
