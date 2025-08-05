"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_contact_us", "contact_greeting", {
      type: Sequelize.TEXT,
      allowNull: true, // or false if it should be required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_contact_us", "contact_greeting", {
      type: Sequelize.STRING,
      allowNull: true, // match the original definition
    });
  },
};
