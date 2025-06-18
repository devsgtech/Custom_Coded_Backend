"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_uploaded_attachments", "code_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert it back to INTEGER in the down migration
    await queryInterface.changeColumn("tbl_uploaded_attachments", "code_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
