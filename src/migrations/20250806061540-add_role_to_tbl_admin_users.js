"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tbl_admin_users", "role", {
      type: Sequelize.ENUM("Admin", "Developer", "Editor"),
      allowNull: false,
      defaultValue: "Admin",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tbl_admin_users", "role");
  },
};