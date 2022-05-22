'use strict';
const { string } = require('pg-format');
const {Model} = require('sequelize');
const authorValidator = require('../services/validators/authorValidator');

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.belongsToMany(models.Book, { 
        through: 'book_author',
        foreignKey: 'author_id',
      });
    }

    static createInstance(data) {
      const instance = Author.build();
      instance.id = data.id;
      instance.given_names = data.given_names;
      instance.surname = data.surname;
      instance.country_origin = data.country_origin;
      instance.bio = data.bio;

      return instance;
    }
  }

  Author.init({
    given_names: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        // Need to test this
        isAtLeastOneName(value){
          if(value == null){
            if(this.given_names !== ''){
              return;
            }else{
              throw new Error('One of surname or given names must not be empty');
            }
          };
        }
      }
    },
    country_origin: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    bio: DataTypes.TEXT,
    profile_picture: DataTypes.STRING,
    birth_date: DataTypes.DATEONLY,
    death_date: {
      type: DataTypes.DATEONLY, 
    },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'authors',
    modelName: 'Author',
    hooks: {
      beforeCreate: (authorAttributes, options) => {
        authorValidator.validate(authorAttributes);
      }
    }
  });
  return Author;
};