import { AttachmentObjectTypeId } from "common/general";
import DataType, { BuildOptions, Model, Sequelize } from "sequelize";

export interface AttachmentAttributes extends Model {
    id: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    objectId: number;
    objectTypeId: AttachmentObjectTypeId;
    createdAt: Date;
    updatedAt: Date;
}

export type AttachmentsInstance = typeof Model & {
    new(values?: object, options?: BuildOptions): AttachmentAttributes;
    associate?: Function;
};

export default (sequelize: Sequelize, DataTypes: typeof DataType): AttachmentsInstance => {
    const attachments = <AttachmentsInstance>sequelize.define("attachments", {
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mimeType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        objectId: {
            type: DataTypes.INTEGER,
        },
        objectTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        paranoid: true
    });
    attachments.associate = (models: { [key: string]: any }) => {

    }
    return attachments;
}