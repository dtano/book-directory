'use strict';
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Untitled',
      },
      pages: {
        type: DataTypes.INTEGER,
      },
      genre: {
        type: DataTypes.STRING,
      },
      date_published: {
        type: DataTypes.DATEONLY,
      },
      cover: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('books', {truncate: true, restartIdentity: true});
  }
};