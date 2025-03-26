"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_uploaded_video", {
      uploaded_video_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uploaded_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_generated_code", // Ensure tbl_generated_code exists before migrating
          key: "code_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_uploaded_video");
  },
};
