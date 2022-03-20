const {pool} = require('../config/db_setup');
const format = require('pg-format');
const fs = require('fs');
const path = require('path');

// A extensive strip of a string
const completeStrip = (str) => {
  // Trim trailing, leading and separating whitespaces, replace punctuation with blanks and turn the string into lowercase
  return str.trim().replace(/\s/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').toLowerCase();
};

// Specific logic on finding duplicate book
const checkDupBook = async (book, duplicates) => {
  if (duplicates.rows.length > 0) {
    for (dup of duplicates.rows) {
      // Now we need to see if the author id is the same as the give information
      const authors = await getBookAuthor(dup.id);
      const idArr = [];
      for (const author of authors) {
        idArr.push(author.id);
      }

      // Now we need to know whether book.author_ids is equal to authors, so we'll need a set
      const authorSet = new Set(book.author_ids + idArr);
      if (authorSet.size === book.author_ids.length) {
        // Means that this book with the same title, has the same authors as well
        return true;
      }
    }
  }

  return false;
};

const clearDirectory = (dirName) => {
  fs.readdir(dirName, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(dirName, file), err => {
        if (err) throw err;
      });
    }
  });
};

// Check the presence of an array of authors
const checkAuthorPresence = async (authorIds = []) => {
  if (authorIds.length === 0) {
    throw new Error('No authors specified');
  }

  const query = format('SELECT * FROM authors WHERE id IN (%L)', authorIds);
  const authors = await pool.query(query, []);

  if (authors.rows.length === authorIds.length) {
    // Means that all authors are valid
    return true;
  }
  return false;
};

// Returns a list of authors who wrote the book
const getBookAuthor = async (bookID) => {
  const query = 'SELECT a.id, a.given_names, a.surname FROM book_author ba JOIN authors a ON (ba.author_id = a.id) WHERE ba.book_id = $1;';

  const writers = await pool.query(query, [bookID]);

  return writers.rows;
};

// Checks for duplicate entries in the given table
const checkDupEntry = async (entry, tableName) => {
  let query = `SELECT * FROM ${tableName} `;
  let duplicates = [];
  // Different tables have different logic when it comes to finding duplicates
  switch (tableName) {
    case 'books':
      query += `WHERE title = $1`;
      // console.log(entry[title]);
      if (!('title' in entry)) {
        throw new Error('The entry does not have the book identifier: title');
      }
      duplicates = await pool.query(query, [entry.title]);


      return checkDupBook(entry, duplicates);
    case 'authors':
      // If an author has the same name and country of origin, then i have no idea
      query += `WHERE surname = $1 AND given_names = $2 AND country_origin = $3`;
      // Ideally, the books created by this author needs to be checked too
      duplicates = await pool.query(query, [entry.surname, entry.given_names, entry.country_origin]);
      if (duplicates.rows.length > 0) {
        return true;
      }
      break;
  }

  return false;
};

const getAllEntries = async (tableName) => {
  const allEntries = await pool.query(`SELECT * FROM ${tableName}`);
  if (allEntries.rows == 0) {
    throw new Error('No entries listed');
  }
  return allEntries.rows;
};

// Code taken from https://stackoverflow.com/questions/21759852/easier-way-to-update-data-with-node-postgres/21763631
const createUpdateQuery = (tableName, conditions = {}, data = {}) => {
  if (!tableName || Object.keys(conditions).length === 0 || Object.keys(data).length === 0) {
    return {'query': '', 'values': []};
  }
  // Get keys from the given data (e.g., title="Blah". title will be added to dKeys)
  const dKeys = Object.keys(data);
  const dataTuples = dKeys.map((k, index) => `${k} = $${index + 1}`); // Create the update tuples (title = $1)
  const updates = dataTuples.join(', ');
  const len = Object.keys(data).length;

  let query = `UPDATE ${tableName} SET ${updates}`;

  const keys = Object.keys(conditions);
  const condTuples = keys.map((k, index) => `${k} = $${index + 1 + len} `);
  const condPlaceholders = condTuples.join('AND ');

  query += ` WHERE ${condPlaceholders} RETURNING *`;

  const values = [];
  Object.keys(data).forEach(key => {
    values.push(data[key]);
  });
  Object.keys(conditions).forEach(key => {
    values.push(conditions[key]);
  });


  return {query, values};
};


// Creates an INSERT query with the given data and tablename
// HOW TO USE: const {query, values} = createInsertQuery('authors', {...req.body, ...authorImg});
const createInsertQuery = (tableName, data) => {
  if (!tableName || Object.keys(data).length === 0) {
    return {'query': '', 'values': []};
  }

  const dKeys = Object.keys(data);
  const columnNamesStr = dKeys.join(', ');
  const valuesStr = dKeys.map((key, ind) => `$${ind + 1}`).join(', ');
  // const dataTuples = dKeys.map((k, index) => `${k} = $${index + 1}`); // Create the update tuples (title = $1)

  const query = `INSERT INTO ${tableName} (${columnNamesStr}) VALUES(${valuesStr}) RETURNING *`;

  const values = [];
  dKeys.forEach((key) => values.push(data[key]));

  return {query, values};
};

// Truncates the given table
const resetTable = async (tableName) => {
  // Need to check whether table_name is valid or not. Just assume that table_name will always be valid
  await pool.query('TRUNCATE TABLE $1', [tableName]);
  console.log('Table has been truncated');
};

// Deletes the file specified by the filepath
const deleteFile = (filepath) => {
  if (filepath != null) {
    fs.unlink(filepath, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully deleted file');
      }
    });
  }
};

// Checks whether all values in b exist in a
const checkArrayContent = (a = [], b = []) => {
  const set = new Set([...a, ...b]);
  return set.size === a.length;
};

// Checks whether both arrays given contain all unique values
const checkUniqueness = (a = [], b = []) => {
  const set = new Set([...a, ...b]);
  return set.size === (a.length + b.length);
};

const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

const isNullOrEmpty = (obj) => {
  return obj == null || isEmpty(obj);
}

module.exports = {
  getAllEntries,
  completeStrip,
  checkDupEntry,
  createUpdateQuery,
  createInsertQuery,
  resetTable,
  getBookAuthor,
  checkAuthorPresence,
  checkArrayContent,
  checkUniqueness,
  deleteFile,
  clearDirectory,
  isEmpty,
  isNullOrEmpty,
};
