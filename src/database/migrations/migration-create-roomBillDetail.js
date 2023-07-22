"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("room_bill_details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      billId: {
        type: Sequelize.INTEGER,
      },
      roomId: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.INTEGER,
      },
      discount: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.STRING,
      },
      bookedDate: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      totalPrice: {
        type: Sequelize.DOUBLE,
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
    await queryInterface.dropTable("room_bill_details");
  },
};
