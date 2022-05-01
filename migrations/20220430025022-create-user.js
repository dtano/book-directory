'use strict';
module.exports = {
  async up (queryInterface, DataTypes) {
    return queryInterface.createTable('users', {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  },

  async down (queryInterface, DataTypes) {
    await queryInterface.dropTable('users', {truncate: true, restartIdentity: true,});
  }
};
