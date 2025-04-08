"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove unnecessary columns
    await queryInterface.removeColumn("tbl_user_session", "user_agent");
    await queryInterface.removeColumn("tbl_user_session", "device_type");
    await queryInterface.removeColumn("tbl_user_session", "browser");
    await queryInterface.removeColumn("tbl_user_session", "os");

    // Add new column category_id with constraints
    await queryInterface.addColumn("tbl_user_session", "category_id", {
      type: Sequelize.ENUM("P", "E", "M", "B", "T"), // Restricts to these 5 values
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add removed columns if rolling back
    await queryInterface.addColumn("tbl_user_session", "user_agent", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("tbl_user_session", "device_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("tbl_user_session", "browser", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("tbl_user_session", "os", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Remove category_id if rolling back
    await queryInterface.removeColumn("tbl_user_session", "category_id");
  },
};
