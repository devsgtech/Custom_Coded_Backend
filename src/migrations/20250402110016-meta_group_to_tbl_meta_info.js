"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_meta_info", "meta_group", {
        type: Sequelize.STRING,
        allowNull: false,
      after: "meta_value", // Optional: If you want to place it after faq_answer
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_meta_info", "meta_group");
  },
};
