'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsToMany(models.Author, { 
        through: 'book_author', 
        foreignKey: 'author_id', 
      });
    }

    toJSON(){
      return {...this.get(), id: undefined}
    }
  }

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Untitled'
    },
    pages: DataTypes.INTEGER,
    date_published: DataTypes.DATE,
    cover: DataTypes.STRING,
  }, {
    sequelize,
    timestamps: false,
    tableName: 'books',
    modelName: 'Book',
  });
  
  return Book;
};