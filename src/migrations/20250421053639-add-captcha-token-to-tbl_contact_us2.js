'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Rename column
    await queryInterface.renameColumn('tbl_contact_us', 'country_captcha_token', 'contact_captcha_token');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert column name
    await queryInterface.renameColumn('tbl_contact_us', 'contact_captcha_token', 'country_captcha_token');
  }
};
