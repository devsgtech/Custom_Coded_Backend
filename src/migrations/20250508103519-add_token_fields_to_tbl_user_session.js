"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add "token" column
    await queryInterface.addColumn("tbl_user_session", "token", {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if you want to require it
    });

    // Add "token_expiry" column
    await queryInterface.addColumn("tbl_user_session", "token_expiry", {
      type: Sequelize.DATE,
      allowNull: true, // Set to false if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: Remove both columns
    await queryInterface.removeColumn("tbl_user_session", "token");
    await queryInterface.removeColumn("tbl_user_session", "token_expiry");
  },
};
