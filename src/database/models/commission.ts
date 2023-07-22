import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { EServiceType } from "common/general";

export interface commissionAttributes extends Model {
  id: number;
  serviceType: EServiceType;
  minPrice: number;
  maxPrice: number;
  rate: number;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type commissionsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): commissionAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): commissionsInstance => {
  const commissions = <commissionsInstance>sequelize.define(
    "commissions",
    {
      serviceType: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      minPrice: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      },
      maxPrice: {
        type: DataTypes.DOUBLE,
      },
      rate: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      }
    },
    {
      paranoid: true,
    }
  );
  commissions.associate = (models: { [key: string]: any }) => {
    // commissions.belongsTo(models.tour_schedules, {
    //   as: 'tourDetail',
    //   foreignKey: 'scheduleId',
    //   constraints: false
    // });
  };
  return commissions;
};
