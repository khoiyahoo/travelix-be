/* eslint-disable @typescript-eslint/no-explicit-any */
import { EServiceType } from "common/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface CommentAttributes extends Model {
  dataValues: any;
  id: number;
  serviceId: number;
  serviceType: EServiceType;
  userId: number;
  billId: number;
  content: string;
  images: string[];
  rate: number;
  commentRepliedId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type CommentsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): CommentAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): CommentsInstance => {
  const comments = <CommentsInstance>sequelize.define(
    "comments",
    {
      serviceId: {
        type: DataTypes.INTEGER,
      },
      serviceType: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      billId: {
        type: DataTypes.INTEGER,
      },
      content: {
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
    },
    {
      paranoid: true,
    }
  );
  comments.associate = (models: { [key: string]: any }) => {
    comments.belongsTo(models.tours, {
      as: 'tourInfo',
      foreignKey: 'serviceId',
      constraints: false
    });
    comments.belongsTo(models.tours, {
      as: 'stayInfo',
      foreignKey: 'serviceId',
      constraints: false
    });
    comments.belongsTo(models.users, {
      as: 'reviewer',
      foreignKey: 'userId',
      constraints: false
    });
    comments.belongsTo(models.tour_bills, {
      as: 'tourBillData',
      foreignKey: 'billId',
      constraints: false
    });
    comments.belongsTo(models.room_bills, {
      as: 'roomBillData',
      foreignKey: 'billId',
      constraints: false
    });
    comments.hasMany(models.comments, {
      as: 'replies',
      foreignKey: 'commentRepliedId',
      constraints: false
    })
  };
  return comments;
};
