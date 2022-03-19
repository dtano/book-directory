'use strict';

module.exports = {
  async up (queryInterface, DataTypes) {
    return queryInterface.createTable(
      'book_author', 
      {
        book_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        author_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE
      }
    );
  },

  async down (queryInterface, DataTypes) {
    return queryInterface.dropTable('book_author');
  }
};
