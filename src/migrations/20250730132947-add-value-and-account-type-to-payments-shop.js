"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_payments_Shop", "value", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_payments_Shop", "account_type", {
      type: Sequelize.ENUM("premium", "normal"),
      allowNull: false,
      defaultValue: "normal",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_payments_Shop", "value");
    await queryInterface.removeColumn("tbl_payments_Shop", "account_type");

    // Drop ENUM type manually (important for PostgreSQL)
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tbl_payments_Shop_account_type";');
    }
  },
};
