"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_user_session", {
      session_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      session_start: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      session_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      session_ip: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_generated_code", // Ensure this table exists before migrating
          key: "code_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      device_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      browser: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      os: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      session_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      log_type: {
        type: Sequelize.ENUM(
          "Auth_Fail",
          "MFA_Fail",
          "Login",
          "Logout",
          "Permission Change",
          "Update Settings",
          "Click",
          "Preference Change",
          "Purchase",
          "IP_Ban",
          "Honeypot_Triggered"
        ),
        allowNull: false,
      },
      action_details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_user_session");
  },
};
