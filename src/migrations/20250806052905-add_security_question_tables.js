"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create tbl_security_questions
    await queryInterface.createTable("tbl_security_questions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    // Create tbl_security_question_ans_mapping
    await queryInterface.createTable("tbl_security_question_ans_mapping", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admin_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_admin_users",
          key: "admin_id",
        },
        onDelete: "CASCADE",
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_security_questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      answer: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tbl_security_question_ans_mapping");
    await queryInterface.dropTable("tbl_security_questions");
  },
};
