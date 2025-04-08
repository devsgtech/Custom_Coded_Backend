"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_payment_history", "CHECKOUT_EMAIL", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payment_history", "BILLING_COUNTRY", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payment_history", "ISSUER_COUNTRY", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payment_history", "CHARGE_STATUS", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payment_history", "CHECKOUT_TIMESTAMP", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payment_history", "PDT_NO", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payment_history", "QTY", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_payment_history", "CHECKOUT_EMAIL");
    await queryInterface.removeColumn("tbl_payment_history", "BILLING_COUNTRY");
    await queryInterface.removeColumn("tbl_payment_history", "ISSUER_COUNTRY");
    await queryInterface.removeColumn("tbl_payment_history", "CHARGE_STATUS");
    await queryInterface.removeColumn("tbl_payment_history", "CHECKOUT_TIMESTAMP");
    await queryInterface.removeColumn("tbl_payment_history", "PDT_NO");
    await queryInterface.removeColumn("tbl_payment_history", "QTY");
  },
};
