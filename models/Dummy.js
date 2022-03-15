'use strict';
const {Model} = require('sequelize');

class Dummy extends Model {
  static associate(models) {

  }
};

module.exports = (sequelize, DataTypes) => {
  Dummy.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
  }, {
    sequelize,
    tableName: 'dummies',
    modelName: 'Dummy',
  });

  return Dummy;
};
