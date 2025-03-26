"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_analytics", {
      analytic_id: {
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
      metric_type: {
        type: Sequelize.ENUM("Bounce Rate", "Conversion Rate", "Abandoned Cart"),
        allowNull: false,
      },
      page_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      total_visitors: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_conversions: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      conversion_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      bounce_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      stripe_status: {
        type: Sequelize.ENUM("Expired", "Pending"),
        allowNull: true,
      },
      creation_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_analytics");
  },
};
