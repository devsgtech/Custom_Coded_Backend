"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_payments_Shop", "code_id", {
      type: Sequelize.INTEGER,
      allowNull: false, // adjust if it should allow nulls
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_payments_Shop", "code_id", {
      type: Sequelize.STRING,
      allowNull: false, // same here, adjust as needed
    });
  },
};
