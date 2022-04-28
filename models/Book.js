'use strict';
const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsToMany(models.Author, { 
        through: 'book_author', 
        foreignKey: 'book_id', 
      });
    }

    static async validatedUpdate(updates, options){
      const columnNames = Object.keys(Book.getAttributes);
      const updateNames = Object.keys(updates);

      updateNames.forEach(updateName => {
        // throw an Error if we can't find one.
        if (!columnNames.some((columnName) => columnName == updateName)) {
          throw new Error(`The field ${updateName} does not exist.`);
        }
      });
      
      return this.update(updates, options);
    }

  }

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Untitled'
    },
    pages: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      }
    },
    date_published: DataTypes.DATEONLY,
    cover: DataTypes.STRING,
    description: DataTypes.TEXT,
  }, {
    sequelize,
    timestamps: false,
    tableName: 'books',
    modelName: 'Book',
  });
  
  return Book;
};