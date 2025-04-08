"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_contact_us", "country", {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if you want to make it required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_contact_us", "country");
  },
};
