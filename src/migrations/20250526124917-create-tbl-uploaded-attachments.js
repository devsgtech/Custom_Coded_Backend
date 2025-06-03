"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_uploaded_attachments", {
      uploded_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uploded_video_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      uploaded_audio_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uploaded_images_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uploaded_background_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      columns_remarks: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_uploaded_attachments");
  },
};
