"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_generated_video_info", "Email_address", {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if it's required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_generated_video_info", "Email_address");
  },
};
