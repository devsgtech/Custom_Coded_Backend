"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_generated_video_info", {
      video_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      generated_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      text: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      text_font_style: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      text_font_color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      text_font_alignment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      background_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      overlay_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      opening_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uploaded_video_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      final_video_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      final_video_generated_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      final_video_generated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_generated_video_info");
  },
};
