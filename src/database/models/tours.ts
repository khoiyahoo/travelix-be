/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";
import { LANG } from "common/general";
import { Ilocation } from "modules/enterprise_dashboard/tour/tour.models";

export interface TourAttributes extends Model {
  dataValues: ModelsAttributes.Tour;
  id: number;
  title: string;
  images: string[];
  numberOfDays: number;
  numberOfNights: number;
  cityStart: Ilocation;
  districtStart: Ilocation;
  communeStart: Ilocation;
  moreLocationStart: string;
  city: Ilocation;
  district: Ilocation;
  commune: Ilocation;
  moreLocation: string;
  contact: string;
  description: string;
  suitablePerson: string;
  highlight: string;
  termsAndCondition: string;
  numberOfReviewer: number;
  rate: number;
  policyId: number;
  minPrice: number;
  maxPrice: number;
  latestTourDate: Date;
  creator: number;
  owner: number;
  isDeleted: boolean;
  parentLanguage: number;
  language: string;
  tourOnSales: ModelsAttributes.TourOnSale[];
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type ToursInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourAttributes;
  associate?: Function;
};

export default (
  sequelize: Sequelize,
  DataTypes: typeof DataType
): ToursInstance => {
  const tours = <ToursInstance>sequelize.define(
    "tours",
    {
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      images: {
        type: DataTypes.TEXT({ length: 'long' }),
        get() {
            return JSON.parse(this.getDataValue('images') || "[]");
        },
        set(value: any) {
            this.setDataValue('images', JSON.stringify(value || []));
        }
      },
      numberOfDays: {
        type: DataTypes.INTEGER,
      },
      numberOfNights: {
        type: DataTypes.INTEGER,
      },
      cityStart: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue('cityStart') || '{}');
        },
        set(value: any) {
          this.setDataValue('cityStart', JSON.stringify(value || {}));
        }
      },
      districtStart: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue('districtStart') || '{}');
        },
        set(value: any) {
          this.setDataValue('districtStart', JSON.stringify(value || {}));
        }
      },
      communeStart: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue('communeStart') || '{}');
        },
        set(value: any) {
          this.setDataValue('communeStart', JSON.stringify(value || {}));
        }
      },
      moreLocationStart: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue('city') || '{}');
        },
        set(value: any) {
          this.setDataValue('city', JSON.stringify(value || {}));
        }
      },
      district: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue('district') || '{}');
        },
        set(value: any) {
          this.setDataValue('district', JSON.stringify(value || {}));
        }
      },
      commune: {
        type: DataTypes.STRING,
        get() {
          return JSON.parse(this.getDataValue('commune') || '{}');
        },
        set(value: any) {
          this.setDataValue('commune', JSON.stringify(value || {}));
        }
      },
      moreLocation: {
        type: DataTypes.STRING,
      },
      contact: {
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      suitablePerson: {
        allowNull: false,
        type: DataTypes.TEXT,
        get() {
            return JSON.parse(this.getDataValue('suitablePerson') || "[]");
        },
        set(value: any) {
            this.setDataValue('suitablePerson', JSON.stringify(value || []));
        }
      },
      highlight: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      termsAndCondition: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      policyId: {
        type: DataTypes.INTEGER,
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
      latestTourDate: {
        type: DataTypes.DATE,
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
  tours.associate = (models: { [key: string]: any }) => {
    tours.hasMany(models.tours, {
      as: 'languages',
      foreignKey: 'parentLanguage',
      constraints: false
    })
    tours.hasMany(models.tour_schedules, {
      as: 'tourSchedules',
      foreignKey: 'tourId',
      constraints: false
    });
    tours.hasMany(models.tour_on_sales, {
      as: 'tourOnSales',
      foreignKey: 'tourId',
      constraints: false
    });
    tours.hasMany(models.policies, {
      as: 'tourPolicies',
      foreignKey: 'serviceId',
      constraints: false
    });
    tours.belongsTo(models.users, {
      as: 'tourCreator',
      foreignKey: 'creator',
      constraints: false
    });
    tours.belongsTo(models.users, {
      as: 'tourOwner',
      foreignKey: 'owner',
      constraints: false
    });
    tours.hasMany(models.tour_bills, {
      as: 'bookedTour',
      foreignKey: 'tourId',
      constraints: false
    });
    tours.hasMany(models.policies, {
      as: 'policies',
      foreignKey: 'policyId',
      constraints: false
    });
  };
  return tours;
};
