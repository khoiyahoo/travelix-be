import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourPriceAttributes extends Model {
  dataValues: object;
  id: number;
  tourOnSaleId: number;
  title: string;
  minOld: number;
  maxOld: number;
  price: number;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type TourPricesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourPriceAttributes;
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): TourPricesInstance => {
  const tour_prices = <TourPricesInstance>sequelize.define(
    "tour_prices",
    {
      tourOnSaleId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
      },
      minOld: {
        type: DataTypes.INTEGER,
      },
      maxOld: {
        type: DataTypes.INTEGER,
      },
      price: {
        type: DataTypes.DOUBLE,
      }
    },
    {
      paranoid: true,
    }
  );
  tour_prices.associate = (models: { [key: string]: any }) => {
    // tour_prices.belongsTo(models.tours, {
    //   as: 'tourDetail',
    //   foreignKey: 'tourId',
    //   constraints: false
    // });
  };
  return tour_prices;
};
