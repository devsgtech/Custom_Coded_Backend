"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_admin_security_questions_answers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_admin_security_questions",
          key: "question_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_admin_users",
          key: "admin_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      question_response: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      question_response_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // 0 -> Not deleted, 1 -> Deleted
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_admin_security_questions_answers");
  },
};
