'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('authors', [
     {
       given_names: 'John',
       surname: 'Doe',
       country_origin: 'USA',
     },
     {
      given_names: 'Jane',
      surname: 'Doe',
      country_origin: 'England',
     },
     {
       given_names: 'Mika',
       surname: 'Kutani',
       country_origin: 'Japan',
     }
    ]);
  },

  async down (queryInterface, Sequelize) {
     return queryInterface.bulkDelete('authors', null, {truncate:true, restartIdentity: true});
  }
};
