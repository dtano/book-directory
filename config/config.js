require('dotenv').config();

const {PGUSER, PGHOST, PGPASSWORD, PGDATABASE} = process.env;

module.exports = {
  "development": {
    "username": PGUSER,
    "password": PGPASSWORD,
    "database": PGDATABASE,
    "host": PGHOST,
    "dialect": "postgres"
  },
  "test": {
    "username": PGUSER,
    "password": PGPASSWORD,
    "database": "book_db_test",
    "host": PGHOST,
    "dialect": "postgres"
  },
  "production": {
    "username": PGUSER,
    "password": PGPASSWORD,
    "database": PGDATABASE,
    "host": PGHOST,
    "dialect": "postgres"
  }
}
