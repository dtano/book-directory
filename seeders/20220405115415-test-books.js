'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('books', [
      {
        title: 'Sharing is Caring',
        pages: 200,
        date_published: '1990-01-01'
      },
      {
        title: 'Deebo the Gift Dragon',
        pages: 300,
        date_published: '1986-10-10'
      },
      {
        title: 'Apocalypse Later',
        pages: 750,
        date_published: '2012-12-12'
      }
     ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('books', null, {truncate: true, restartIdentity: true});
  }
};
