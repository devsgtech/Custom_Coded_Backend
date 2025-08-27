"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_contact_us", "status", {
      type: Sequelize.ENUM("pending", "replied", "ignored"),
      allowNull: false, 
      defaultValue: "pending",
      comment: "Contact status: pending, replied, ignored",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_contact_us", "status");

    // It's good practice to remove ENUM type manually
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tbl_contact_us_status";');
  },
};