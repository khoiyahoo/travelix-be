/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    debug: true,
    dialectOptions: {
      bigNumberStrings: true,
    },
    define: {
      freezeTableName: true,
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci',
        decimalNumbers: true,
      }
    },
    seederStorage: "sequelize",
    seederStorageTableName: "seeder",
    migrationStorage: "sequelize",
    migrationStorageTableName: "migration",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    },
    define: {
      freezeTableName: true,
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci',
        decimalNumbers: true,
      }
    },
    seederStorage: "sequelize",
    seederStorageTableName: "seeder",
    migrationStorage: "sequelize",
    migrationStorageTableName: "migration",
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    debug: true,
    dialectOptions: {
      bigNumberStrings: true,
    },
    define: {
      freezeTableName: true,
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci',
        decimalNumbers: true,
      }
    },
    seederStorage: "sequelize",
    seederStorageTableName: "seeder",
    migrationStorage: "sequelize",
    migrationStorageTableName: "migration",
  }
}

module.exports = config[process.env.NODE_ENV];