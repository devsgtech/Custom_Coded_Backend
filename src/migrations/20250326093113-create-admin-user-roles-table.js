module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_admin_user_roles", {
      role_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      role_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // 0 -> Not deleted, 1 -> Deleted
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_admin_user_roles");
  },
};
