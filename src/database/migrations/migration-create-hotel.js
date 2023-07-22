"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("hotels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      checkInTime: {
        type: Sequelize.STRING,
      },
      checkOutTime: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      contact: {
        type: Sequelize.STRING,
      },
      tags: {
        type: Sequelize.STRING,
      },
      images: {
        type: Sequelize.STRING,
      },
      creator: {
        type: Sequelize.INTEGER,
      },
      rate: {
        type: Sequelize.DOUBLE,
      },
      numberOfReviewer: {
        type: Sequelize.INTEGER,
      },
      isTemporarilyStopWorking: {
        type: Sequelize.BOOLEAN,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        default: null,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("hotels");
  },
};
