'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tbl_user_session', 'session_timezone', {
      type: Sequelize.STRING,
      allowNull: true, // or false if it should be required
      defaultValue: null, // Optional default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tbl_user_session', 'session_timezone');
  }
};
