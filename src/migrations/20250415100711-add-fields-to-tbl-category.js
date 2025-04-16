"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add "category_serial_number" column
    await queryInterface.addColumn("tbl_category", "category_serial_number", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Add "category_image" column
    await queryInterface.addColumn("tbl_category", "category_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add "category_information_text_1" column
    await queryInterface.addColumn("tbl_category", "category_information_text_1", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add "category_information_text_2" column
    await queryInterface.addColumn("tbl_category", "category_information_text_2", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Add "category_information_text_3" column
    await queryInterface.addColumn("tbl_category", "category_information_text_3", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: Remove all added columns
    await queryInterface.removeColumn("tbl_category", "category_serial_number");
    await queryInterface.removeColumn("tbl_category", "category_image");
    await queryInterface.removeColumn("tbl_category", "category_information_text_1");
    await queryInterface.removeColumn("tbl_category", "category_information_text_2");
    await queryInterface.removeColumn("tbl_category", "category_information_text_3");
  },
};
