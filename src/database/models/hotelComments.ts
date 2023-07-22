import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface HotelCommentAttributes extends Model {
  dataValues: any;
  id: number;
  hotelId: number;
  userId: number;
  billId: number;
  comment: string;
  rate: number;
  replyComment: string;
  isRequestDelete: boolean;
  reasonForDelete: string;
  isDecline: boolean;
  reasonForDecline: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export type HotelCommentsInstance = typeof Model & {
  new (values?: object, options?: BuildOptions): HotelCommentAttributes;
  // eslint-disable-next-line @typescript-eslint/ban-types
  associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): HotelCommentsInstance => {
  const hotel_comments = <HotelCommentsInstance>sequelize.define(
    "hotel_comments",
    {
      comment: {
        type: DataTypes.TEXT,
      },
      replyComment: {
        type: DataTypes.TEXT,
      },
      isRequestDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reasonForDelete: {
        type: DataTypes.TEXT,
      },
      isDecline: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reasonForDecline: {
        type: DataTypes.TEXT,
      },
      rate: {
        type: DataTypes.INTEGER,
      },
      hotelId: {
        type: DataTypes.INTEGER,
      },
      billId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      paranoid: true,
    }
  );
  hotel_comments.associate = (models: { [key: string]: any }) => {
    // hotel_comments.belongsTo(models.hotels, {
    //   as: 'hotelInfo',
    //   foreignKey: 'hotelId',
    //   constraints: false
    // });
    // hotel_comments.belongsTo(models.users, {
    //   as: 'hotelReviewer',
    //   foreignKey: 'userId',
    //   constraints: false
    // });
    // hotel_comments.belongsTo(models.room_bills, {
    //   as: 'belongToRoomBill',
    //   foreignKey: 'billId',
    //   constraints: false
    // });
  };
  return hotel_comments;
};
