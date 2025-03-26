module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('admins', 'tbl_admin_users'); // Change table name
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('tbl_admin_users', 'admins'); // Revert if needed
  }
};
