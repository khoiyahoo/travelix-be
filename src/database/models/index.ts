import fs from "fs";
import path from "path";
import { DataTypes, Model, Sequelize } from "sequelize";
import config from "config/database";

interface DatabaseType {
  [key: string]: any;
}

export const sequelize = new Sequelize(config.database, config.username, config.password, config);

const basename = path.basename(__filename);

const database: DatabaseType = {
  sequelize,
};

fs.readdirSync(__dirname)
  .filter((file: string) => {
    return file.indexOf(".") !== 0 && file !== basename && (file.slice(-3) === ".ts" || file.slice(-3) === ".js");
  })
  .forEach((file: string) => {
    const model: typeof Model = require(path.join(__dirname, file)).default(sequelize, DataTypes);
    database[model.name] = model;
  });

  // console.log(database, "=======database========="

Object.keys(database).forEach((modelName: string) => {
  if (database[modelName].associate) {
    database[modelName].associate(database);
  }
});

export default database;
