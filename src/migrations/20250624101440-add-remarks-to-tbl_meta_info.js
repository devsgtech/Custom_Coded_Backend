"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_meta_info", "remarks", {
      type: Sequelize.TEXT,
      allowNull: true, // Change to false if you want it required
      comment: "Optional remarks or notes",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_meta_info", "remarks");
  },
};
