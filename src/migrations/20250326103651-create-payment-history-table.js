"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_payment_history", {
      payment_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      code_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_generated_code", // Ensure tbl_generated_code exists before migrating
          key: "code_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount_paid: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      payment_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      payment_ip: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Assuming false means payment is not confirmed
      },
      payment_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_payment_history");
  },
};
