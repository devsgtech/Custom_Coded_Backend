"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_payment_history", "amount_paid", {
      type: Sequelize.FLOAT,
      allowNull: false, // or true if your column allows NULLs
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("tbl_payment_history", "amount_paid", {
      type: Sequelize.INTEGER,
      allowNull: false, // or true, depending on your original schema
    });
  },
};
