"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_shop", "value", {
      type: Sequelize.INTEGER,
      allowNull: true, // Change to false if required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_shop", "value");
  },
};
