"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tbl_filter_selection", "hfile", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_filter_selection", "lfile", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("tbl_filter_selection", "thumbnail_path", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tbl_filter_selection", "hfile");
    await queryInterface.removeColumn("tbl_filter_selection", "lfile");
    await queryInterface.removeColumn("tbl_filter_selection", "thumbnail_path");
  },
};
