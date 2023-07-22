/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface StayRevenueAttributes extends Model {
  dataValues: object;
  id: number;
  stayId: number;
  revenue: number;
  commission: number;
  section: number; // 1 (1->15), 2(16->end)
  month: number; // 1 -> 12
  year: number;
  isReceivedRevenue: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type StayRevenuesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): StayRevenueAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): StayRevenuesInstance => {
  const stay_revenues = <StayRevenuesInstance>sequelize.define(
    "stay_revenues",
    {
      stayId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      revenue: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      commission: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      section: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      month: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      year: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      isReceivedRevenue: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
    }
  );
  stay_revenues.associate = (models: { [key: string]: any }) => {
    stay_revenues.belongsTo(models.stays, {
      as: "stayInfo",
      foreignKey: "stayId",
      constraints: false,
    });
  };
  return stay_revenues;
};
