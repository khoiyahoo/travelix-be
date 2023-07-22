"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tour_comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      comment: {
        type: Sequelize.TEXT,
      },
      replyComment: {
        type: Sequelize.TEXT,
      },
      isRequestDelete: {
        type: Sequelize.BOOLEAN,
      },
      reasonForDelete: {
        type: Sequelize.TEXT,
      },
      isDecline: {
        type: Sequelize.BOOLEAN,
      },
      reasonForDecline: {
        type: Sequelize.TEXT,
      },
      rate: {
        type: Sequelize.INTEGER,
      },
      tourId: {
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("tour_comments");
  },
};
