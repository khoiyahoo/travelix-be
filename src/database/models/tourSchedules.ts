import { LANG } from "common/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourScheduleAttributes extends Model {
  dataValues: object;
  id: number;
  tourId: number;
  day: number;
  startTime: number;
  endTime: number;
  description: string;
  parentLanguage: number;
  language: string;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type TourSchedulesInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourScheduleAttributes;
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): TourSchedulesInstance => {
  const tour_schedules = <TourSchedulesInstance>sequelize.define(
    "tour_schedules",
    {
      tourId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      day: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      startTime: {
        type: DataTypes.INTEGER,
      },
      endTime: {
        type: DataTypes.INTEGER,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      parentLanguage: {
          type: DataTypes.INTEGER
      },
      language: {
          type: DataTypes.STRING,
          comment: `VietNam: ${LANG.VI}, English: ${LANG.EN}`
      }
    },
    {
      paranoid: true,
    }
  );
  tour_schedules.associate = (models: { [key: string]: any }) => {
    tour_schedules.hasMany(models.tour_schedules, {
      as: 'languages',
      foreignKey: 'parentLanguage',
      constraints: false
    })
    tour_schedules.belongsTo(models.tours, {
      as: 'scheduleItem',
      foreignKey: 'tourId',
      constraints: false
    });
  };
  return tour_schedules;
};
