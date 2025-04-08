"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_category", "tier_pricing", {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if it should be required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_category", "tier_pricing");
  },
};
