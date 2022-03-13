// const { Pool, Client } = require("pg");
// const pg = require("pg");
// const Sequelize = require("sequelize");

// const sequelize = new Sequelize('book_db', process.env.PGUSER, process.env.PGPASSWORD, {
//     dialect: 'postgres'
// });

// // sequelize
// // .authenticate()
// // .then(() => {
// //   console.log('Connection has been established successfully.');
// // })
// // .catch(err => {
// //   console.error('Unable to connect to the database:', err);
// // });

// pg.types.setTypeParser(1082, function(stringValue) {
//   return stringValue;  //1082 for date type
// });

// const pool = new Pool({
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   database: process.env.PGDATABASE,
//   host: process.env.PGHOST
// });
// const client = new Client();

// module.exports = {pool: pool, client: client, sequelize: sequelize};