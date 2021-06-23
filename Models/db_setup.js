const { Pool, Client } = require("pg");
const pg = require("pg");
require("dotenv").config();

pg.types.setTypeParser(1082, function(stringValue) {
  return stringValue;  //1082 for date type
});

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST
});
const client = new Client();

module.exports = {pool: pool, client: client};