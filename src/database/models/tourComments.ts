/* eslint-disable @typescript-eslint/no-explicit-any */
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface TourCommentAttributes extends Model {
  dataValues: any;
  id: number;
  tourId: number;
  userId: number;
  billId: number;
  comment: string;
  images: string[];
  rate: number;
  commentRepliedId: number;
  // replyComment: string;
  // isRequestDelete: boolean;
  // reasonForDelete: string;
  // isDecline: boolean;
  // reasonForDecline: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type TourCommentsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): TourCommentAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): TourCommentsInstance => {
  const tour_comments = <TourCommentsInstance>sequelize.define(
    "tour_comments",
    {
      tourId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      billId: {
        type: DataTypes.INTEGER,
      },
      comment: {
        type: DataTypes.TEXT,
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
      rate: {
        type: DataTypes.INTEGER,
      },
      commentRepliedId: {
        type: DataTypes.INTEGER,
      },
      // replyComment: {
      //   type: DataTypes.TEXT,
      // },
      // isRequestDelete: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
      // reasonForDelete: {
      //   type: DataTypes.TEXT,
      // },
      // isDecline: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
      // reasonForDecline: {
      //   type: DataTypes.TEXT,
      // },
    },
    {
      paranoid: true,
    }
  );
  tour_comments.associate = (models: { [key: string]: any }) => {
    tour_comments.belongsTo(models.tours, {
      as: 'tourInfo',
      foreignKey: 'tourId',
      constraints: false
    });
    tour_comments.belongsTo(models.users, {
      as: 'tourReviewer',
      foreignKey: 'userId',
      constraints: false
    });
    tour_comments.belongsTo(models.tour_bills, {
      as: 'tourBillData',
      foreignKey: 'billId',
      constraints: false
    });
    tour_comments.hasMany(models.tour_comments, {
      as: 'replies',
      foreignKey: 'commentRepliedId',
      constraints: false
    })
  };
  return tour_comments;
};
