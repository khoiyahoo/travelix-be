import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { EServicePolicyType, EServiceType } from "common/general";

export interface policyAttributes extends Model {
  dataValues: object;
  id: number;
  serviceId: number;
  serviceType: EServiceType;
  policyType: EServicePolicyType;
  dayRange: number;
  moneyRate: number;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type policiesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): policyAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): policiesInstance => {
  const policies = <policiesInstance>sequelize.define(
    "policies",
    {
      serviceId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      serviceType: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      policyType: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      dayRange: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      moneyRate: {
        allowNull: false,
        type: DataTypes.DOUBLE,
      }
    },
    {
      paranoid: true,
    }
  );
  policies.associate = (models: { [key: string]: any }) => {
    // policies.belongsTo(models.tour_schedules, {
    //   as: 'tourDetail',
    //   foreignKey: 'scheduleId',
    //   constraints: false
    // });
  };
  return policies;
};
