"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("rooms", {
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
      discount: {
        type: Sequelize.INTEGER,
      },
      tags: {
        type: Sequelize.STRING,
      },
      images: {
        type: Sequelize.STRING,
      },
      hotelId: {
        type: Sequelize.INTEGER,
      },
      numberOfBed: {
        type: Sequelize.INTEGER,
      },
      numberOfRoom: {
        type: Sequelize.INTEGER,
      },
      mondayPrice: {
        type: Sequelize.DOUBLE,
      },
      tuesdayPrice: {
        type: Sequelize.DOUBLE,
      },
      wednesdayPrice: {
        type: Sequelize.DOUBLE,
      },
      thursdayPrice: {
        type: Sequelize.DOUBLE,
      },
      fridayPrice: {
        type: Sequelize.DOUBLE,
      },
      saturdayPrice: {
        type: Sequelize.DOUBLE,
      },
      sundayPrice: {
        type: Sequelize.DOUBLE,
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
    await queryInterface.dropTable("rooms");
  },
};
