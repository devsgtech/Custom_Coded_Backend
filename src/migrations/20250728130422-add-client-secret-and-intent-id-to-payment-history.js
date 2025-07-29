"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_payment_history", "clientSecret", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payment_history", "paymentIntentId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_payment_history", "clientSecret");
    await queryInterface.removeColumn("tbl_payment_history", "paymentIntentId");
  },
};
