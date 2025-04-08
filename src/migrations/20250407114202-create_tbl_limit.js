"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_limit", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      limit_video: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      limit_image: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      limit_audio: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      limit_text: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      limit_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_limit");
  },
};
