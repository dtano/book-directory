'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('book_author', [
      {
        book_id: 1,
        author_id: 1,
      },
      {
        book_id: 2,
        author_id: 2,
      },
      {
        book_id: 3,
        author_id: 3,
      },
     ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('book_author', null, {truncate: true, restartIdentity: true});
  }
};
