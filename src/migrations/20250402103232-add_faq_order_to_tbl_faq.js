"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_faq", "faq_order", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "faq_answer", // Optional: If you want to place it after faq_answer
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_faq", "faq_order");
  },
};
