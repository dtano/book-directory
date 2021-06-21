const { Pool, Client } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST
});
const client = new Client();

module.exports = {pool: pool, client: client};