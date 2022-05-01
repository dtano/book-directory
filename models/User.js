'use strict';
const {Model} = require('sequelize');

class User extends Model {
  static associate(models) {

  }

  toJSON(){
    return {...this.get(), id: undefined}
  }
};

module.exports = (sequelize, DataTypes) => {
  User.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    given_names: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  });

  return User;
};
