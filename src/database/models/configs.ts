import { ConfigType } from "models/config";
import DataType, { BuildOptions, Model, Sequelize } from "sequelize";

export interface ConfigAttributes extends Model {
    id: number;
    name: string;
    key: string;
    value: string;
    type: ConfigType;
    attachment?: ModelsAttributes.Attachment;
    createdAt: Date;
    updatedAt: Date;
}

export type ConfigsInstance = typeof Model & {
    new(values?: object, options?: BuildOptions): ConfigAttributes;
    associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): ConfigsInstance => {
    const configs = <ConfigsInstance>sequelize.define("configs", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.TEXT,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
    configs.associate = (models: { [key: string]: any }) => {

    }
    return configs;
}