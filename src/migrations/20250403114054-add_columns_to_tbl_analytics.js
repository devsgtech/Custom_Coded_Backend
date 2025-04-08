"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_analytics", "user_agent", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_analytics", "device_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_analytics", "browser", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_analytics", "os", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_analytics", "country", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_analytics", "user_ip", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_analytics", "traffic_source", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_analytics", "user_agent");
    await queryInterface.removeColumn("tbl_analytics", "device_type");
    await queryInterface.removeColumn("tbl_analytics", "browser");
    await queryInterface.removeColumn("tbl_analytics", "os");
    await queryInterface.removeColumn("tbl_analytics", "country");
    await queryInterface.removeColumn("tbl_analytics", "traffic_source");
  },
};
