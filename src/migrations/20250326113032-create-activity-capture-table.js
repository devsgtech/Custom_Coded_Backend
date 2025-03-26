"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_activity_capture", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_user_session", // Ensure this table exists before migrating
          key: "session_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      capture_activity: {
        type: Sequelize.ENUM(
          "Cat P",
          "E",
          "M",
          "B",
          "T",
          "ID",
          "Review_Button_Selection",
          "Review_Button_Upload",
          "Download_Button"
        ),
        allowNull: false,
      },
      creation_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_activity_capture");
  },
};
