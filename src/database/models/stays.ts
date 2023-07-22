/* eslint-disable @typescript-eslint/no-explicit-any */
import { LANG } from "common/general";
import { StayType } from "models/general";
import { Ilocation } from "modules/enterprise_dashboard/stay/stay.models";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface StayAttributes extends Model {
  dataValues: object;
  id: number;
  name: string;
  type: StayType;
  images: string[];
  city: Ilocation;
  district: Ilocation;
  commune: Ilocation;
  moreLocation: string;
  contact: string;
  description: string;
  checkInTime: number;
  checkOutTime: number;
  highlight: string;
  convenient: string[];
  termsAndCondition: string;
  minPrice: number;
  maxPrice: number;
  rate: number;
  numberOfReviewer: number;
  creator: number;
  owner: number;
  isDeleted: boolean;
  parentLanguage: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type StaysInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): StayAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): StaysInstance => {
  const stays = <StaysInstance>sequelize.define(
    "stays",
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      type: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 1,
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
      city: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue("city") || "{}");
        },
        set(value: any) {
          this.setDataValue("city", JSON.stringify(value || {}));
        },
      },
      district: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue("district") || "{}");
        },
        set(value: any) {
          this.setDataValue("district", JSON.stringify(value || {}));
        },
      },
      commune: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue("commune") || "{}");
        },
        set(value: any) {
          this.setDataValue("commune", JSON.stringify(value || {}));
        },
      },
      moreLocation: {
        type: DataTypes.STRING,
      },
      contact: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      checkInTime: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      checkOutTime: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      highlight: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      convenient: {
        allowNull: false,
        type: DataTypes.TEXT,
        get() {
          return JSON.parse(this.getDataValue("convenient") || "[]");
        },
        set(value: any) {
          this.setDataValue("convenient", JSON.stringify(value || []));
        },
      },
      termsAndCondition: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      rate: {
        defaultValue: 0,
        type: DataTypes.DOUBLE,
      },
      numberOfReviewer: {
        defaultValue: 0,
        type: DataTypes.INTEGER,
      },
      minPrice: {
        type: DataTypes.DOUBLE,
      },
      maxPrice: {
        type: DataTypes.DOUBLE,
      },
      creator: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      owner: {
        allowNull: false,
        type: DataTypes.INTEGER,
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
  stays.associate = (models: { [key: string]: any }) => {
    stays.hasMany(models.stays, {
      as: "languages",
      foreignKey: "parentLanguage",
      constraints: false,
    });
    stays.belongsTo(models.users, {
      as: "stayOwner",
      foreignKey: "owner",
      constraints: false,
    });
    stays.hasMany(models.rooms, {
      as: "listRooms",
      foreignKey: "stayId",
      constraints: false,
    });
    stays.hasMany(models.policies, {
      as: 'stayPolicies',
      foreignKey: 'serviceId',
      constraints: false
    });
  };
  return stays;
};
