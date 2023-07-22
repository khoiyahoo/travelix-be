"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tour_bills", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      tourId: {
        type: Sequelize.INTEGER,
      },
      amount: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.DOUBLE,
      },
      discount: {
        type: Sequelize.INTEGER,
      },
      totalBill: {
        type: Sequelize.DOUBLE,
      },
      email: {
        type: Sequelize.STRING,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      verifyCode: {
        type: Sequelize.STRING,
      },
      expiredDate: {
        default: null,
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("tour_bills");
  },
};
