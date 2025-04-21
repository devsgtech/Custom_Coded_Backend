'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add new column
    await queryInterface.addColumn('tbl_contact_us', 'contact_captcha_token', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if this should be required
    });

    // 2. Rename column
    await queryInterface.renameColumn('tbl_contact_us', 'country', 'contact_country');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert column name
    await queryInterface.renameColumn('tbl_contact_us', 'contact_country', 'country');

    // Remove the added column
    await queryInterface.removeColumn('tbl_contact_us', 'contact_captcha_token');
  }
};
