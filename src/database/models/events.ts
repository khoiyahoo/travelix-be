/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { EDiscountType, LANG } from "common/general";

export interface EventAttributes extends Model {
  dataValues: object;
  id: number;
  name: string;               //event
  description: string;        //event
  startTime: Date;
  endTime: Date;
  banner: string;             //event
  code: string;               //event
  hotelIds: number[];
  tourIds: number[];
  discountType: EDiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  isQuantityLimit: boolean;
  numberOfCodes: number;
  numberOfCodesUsed: number;
  creator: number;
  owner: number;
  isDeleted: boolean;
  parentLanguage: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type EventsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): EventAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): EventsInstance => {
  const events = <EventsInstance>sequelize.define(
    "events",
    {
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      startTime: {
        type: DataTypes.DATE,
      },
      endTime: {
        type: DataTypes.DATE,
      },
      banner: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      hotelIds: {
        type: DataTypes.TEXT({ length: "long" }),
        get() {
          return JSON.parse(this.getDataValue("hotelIds") || "[]");
        },
        set(value: any) {
          this.setDataValue("hotelIds", JSON.stringify(value || []));
        },
        comment: `All: [-1]`,
      },
      tourIds: {
        type: DataTypes.TEXT({ length: "long" }),
        get() {
          return JSON.parse(this.getDataValue("tourIds") || "[]");
        },
        set(value: any) {
          this.setDataValue("tourIds", JSON.stringify(value || []));
        },
        comment: `All: [-1]`,
      },
      discountType: {
        type: DataTypes.INTEGER,
        comment: "1: money, 2: percent",
      },
      discountValue: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      minOrder: {
        type: DataTypes.INTEGER,
      },
      maxDiscount: {
        type: DataTypes.INTEGER,
      },
      isQuantityLimit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      numberOfCodes: {
        type: DataTypes.INTEGER,
      },
      numberOfCodesUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      owner: {
        type: DataTypes.INTEGER,
        comment: `Admin: null`,
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
  events.associate = (models: { [key: string]: any }) => {
    events.hasMany(models.events, {
      as: "languages",
      foreignKey: "parentLanguage",
      constraints: false,
    });
  };
  return events;
};
