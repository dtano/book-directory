'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookAuthor extends Model {
    static associate(models) {
    }

    toJSON(){
      return {...this.get(), id: undefined}
    }
  }

  BookAuthor.init({
    book_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'book_author',
    modelName: 'BookAuthor',
  });
  
  return BookAuthor;
};