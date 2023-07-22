import DataType, { BuildOptions, Model, Sequelize } from "sequelize";

export interface TranslationAttributes extends Model {
    id: number;
    key: string;
    data: string;
    namespace: string,
    language: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TranslationsInstance = typeof Model & {
    new(values?: object, options?: BuildOptions): TranslationAttributes;
    associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): TranslationsInstance => {
    const translations = <TranslationsInstance>sequelize.define("translations", {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        namespace: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'common'
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        paranoid: false
    });
    translations.associate = (models: { [key: string]: any }) => {
        
    }
    return translations;
}