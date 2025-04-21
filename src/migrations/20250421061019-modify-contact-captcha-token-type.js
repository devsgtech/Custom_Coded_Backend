'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tbl_contact_us', 'contact_captcha_token', {
      type: Sequelize.TEXT,
      allowNull: true // Adjust based on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tbl_contact_us', 'contact_captcha_token', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  }
};
