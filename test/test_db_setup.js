const { Pool, Client} = require("pg");
require("dotenv").config();

const Pool = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: "book_db_test",
    host: process.env.PGHOST
});

module.exports = Pool;