'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.belongsToMany(models.Book, { through: 'book_author' });
    }
  }

  Author.init({
    given_names: {
      type: DataTypes.STRING,
      allowNull: false
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country_origin: DataTypes.STRING,
    bio: DataTypes.TEXT,
    profile_picture: DataTypes.STRING,
  }, {
    sequelize,
    tableName: 'authors',
    modelName: 'Author',
  });
  return Author;
};