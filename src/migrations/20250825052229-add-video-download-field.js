"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_generated_video_info", "video_download_time", {
      type: Sequelize.DATE,   // full datetime
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_generated_video_info", "video_download_count", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_generated_video_info", "video_download_time");
    await queryInterface.removeColumn("tbl_generated_video_info", "video_download_count");
  },
};
