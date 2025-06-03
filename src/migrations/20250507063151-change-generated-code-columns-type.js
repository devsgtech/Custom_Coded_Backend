'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tbl_generated_code', 'generated_code', {
      type: Sequelize.STRING,
      allowNull: true // adjust based on your requirement
    });

    await queryInterface.changeColumn('tbl_generated_code', 'generated_code_id', {
      type: Sequelize.STRING,
      allowNull: true // adjust based on your requirement
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tbl_generated_code', 'generated_code', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('tbl_generated_code', 'generated_code_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};
