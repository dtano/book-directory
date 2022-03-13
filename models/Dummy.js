const Sequelize = require("sequelize");
const {sequelize} = require("../config/db_setup");

const Dummy = sequelize.define('dummy', {
    title: Sequelize.STRING,
    description: { type: Sequelize.TEXT, allowNull: false }
});

module.exports = Dummy;