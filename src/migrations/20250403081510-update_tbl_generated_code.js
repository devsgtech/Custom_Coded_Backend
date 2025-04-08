"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the "generated_ip" column
    await queryInterface.removeColumn("tbl_generated_code", "generated_ip");

    // Add the new column "generated_code2" as an integer
    await queryInterface.addColumn("tbl_generated_code", "generated_code2", {
      type: Sequelize.INTEGER,
      allowNull: true, // Change this based on your requirements
    });

    // Add the new column "failed_login_attempt" as an integer (default 0)
    await queryInterface.addColumn("tbl_generated_code", "failed_login_attempt", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the "generated_ip" column in case of rollback
    await queryInterface.addColumn("tbl_generated_code", "generated_ip", {
      type: Sequelize.STRING,
      allowNull: true, // Adjust based on the previous column properties
    });

    // Remove "generated_code2" in case of rollback
    await queryInterface.removeColumn("tbl_generated_code", "generated_code2");

    // Remove "failed_login_attempt" in case of rollback
    await queryInterface.removeColumn("tbl_generated_code", "failed_login_attempt");
  },
};
