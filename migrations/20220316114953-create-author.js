'use strict';
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('authors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      given_names: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country_origin: {
        type: DataTypes.STRING,
      },
      bio: {
        type: DataTypes.TEXT,
      },
      profile_picture: {
        type: DataTypes.STRING,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('authors');
  }
};