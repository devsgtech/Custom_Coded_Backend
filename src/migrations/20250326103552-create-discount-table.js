"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_discount", {
      discount_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_category", // Ensure tbl_category exists before migrating
          key: "category_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      discount_start: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      discount_end: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      last_modified_on: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_modified_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_discount");
  },
};
