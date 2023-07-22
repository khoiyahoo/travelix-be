import { ETypeVerifyCode } from "common/general";
import { BuildOptions, Model, Sequelize } from "sequelize";
import DataType from "sequelize";

export interface VerifyCodeAttributes extends Model {
    id: number;
    code: string;
    userId: number;
    type: ETypeVerifyCode;
    expiredDate: Date;
    staffId: number;
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date,
}

export type VerifyCodesInstance = typeof Model & {
    new(values?: object, options?: BuildOptions): VerifyCodeAttributes;
    associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): VerifyCodesInstance => {
    const verify_codes = <VerifyCodesInstance>sequelize.define("verify_codes", {
        code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: `if (type = 4): ~enterpriseID`
        },
        expiredDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        staffId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
    });
    verify_codes.associate = (models: { [key: string]: any }) => {
        verify_codes.hasMany(models.users, {
          as: "offers",
          foreignKey: "staffId",
          constraints: false,
        });
    }
    return verify_codes;
}