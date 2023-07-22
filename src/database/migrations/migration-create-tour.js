"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tours", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      businessHours: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      contact: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.DOUBLE,
      },
      discount: {
        type: Sequelize.DOUBLE,
      },
      tags: {
        type: Sequelize.STRING,
      },
      images: {
        type: Sequelize.STRING,
      },
      rate: {
        type: Sequelize.DOUBLE,
      },
      numberOfReviewer: {
        type: Sequelize.INTEGER,
      },
      creator: {
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
    await queryInterface.dropTable("tours");
  },
};
