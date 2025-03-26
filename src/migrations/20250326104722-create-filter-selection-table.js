"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_filter_selection", {
      filter_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      filter_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      filter_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      filter_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment:
          "1 - overlay, 2 - opening, 3 - background, 4 - color, 5 - template, 6 - FontStyle",
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_filter_selection");
  },
};
