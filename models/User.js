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
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
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
