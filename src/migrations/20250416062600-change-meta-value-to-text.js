'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('tbl_meta_info', 'meta_value', {
      type: Sequelize.TEXT,
      allowNull: true // or false depending on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('tbl_meta_info', 'meta_value', {
      type: Sequelize.STRING,
      allowNull: true // match original definition
    });
  }
};
