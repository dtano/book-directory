const {pool} = require('../config/db_setup');
const {Author} = require('../models/');
const {checkDupEntry, createUpdateQuery, createInsertQuery, getAllEntries, deleteFile} = require('./general');

// Where images will be stored in the project directory
// const authorUploadPath = path.join("public", "uploads/authors");
const authorImgPath = './public/uploads/authors/';

// Create a new author entry
const postAuthor = async (req, res) => {
  try {
    // Need to validate the given data
    // name and country of origin
    if (await checkDupEntry(req.body, 'authors')) {
      throw new Error('Duplicate author entry');
    }

    // Add the author image file path to the query body if there is an image attached
    // const imgFileName = req.file != null ? req.file.filename : null;
    const authorImg = {profile_picture: req.file != null ? req.file.filename : null};

    const {query, values} = createInsertQuery('authors', {...req.body, ...authorImg});

    const newAuthor = await pool.query(query, values);
    res.status(200).json(newAuthor.rows[0]);
  } catch (err) {
    if (req.file != null) {
      deleteFile(`${authorImgPath}${req.file.filename}`);
    }
    res.status(400).json(err.message);
  }
};

// Returns all author entries to client
const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll();
    res.status(200).json(authors);
    // const allAuthors = await getAllEntries('authors');
    // res.status(200).json(allAuthors);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Gets specified author
const getAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    const responseBody = {};
    //const author = await pool.query('SELECT * FROM authors WHERE id = ($1)', [id]);
    
    const author = await Author.findOne({
      where: {
        id: authorId
      }
    });
    
    if (!author) {
      throw new Error(`author with id = ${authorId} not found`);
    }
    
    responseBody.details = author;

    const writtenBooks = await getAuthorBooks(authorId);
    responseBody.books = writtenBooks;

    res.status(200).json(responseBody);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Updates author entry with given data
const updateAuthor = async (req, res) => {
  const {id} = req.params;
  try {
    if (req.file != null) {
      // Get entry to update
      const author = await pool.query('SELECT * FROM authors WHERE id = ($1)', [id]);
      if (author.rows.length == 0) {
        throw new Error(`Author with id = ${id} not found`);
      }

      // Delete old picture
      deleteFile(`${authorImgPath}${author.rows[0].cover}`);

      // Gotta change the book's cover image with the new filepath
      req.body.cover = req.file.filename;
    }

    // Must make sure that req body is proper
    const {query, values} = createUpdateQuery('authors', {id: id}, req.body);
    updatedEntry = await pool.query(query, values);
    res.status(200).json(updatedEntry.rows[0]);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Deletes author with given id if it exists
const deleteAuthor = async (req, res) => {
  const {id} = req.params;
  try {
    const deletedEntry = await pool.query('DELETE FROM authors WHERE id = ($1) RETURNING *', [id]);
    if (deletedEntry.rows.length == 0) {
      throw new Error(`There is possibly no entry with id = ${id}`);
    }

    if (deletedEntry.rows[0].profile_picture != null) {
      deleteFile(`${authorImgPath}${deletedEntry.rows[0].profile_picture}`);
    }
    res.status(200).json(deletedEntry.rows[0]);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Gets all of the books an author has written
const getAuthorBooks = async (authorID) => {
  const query = 'SELECT b.id, b.title, b.cover FROM book_author ba JOIN books b ON (ba.book_id = b.id) WHERE ba.author_id = $1;';
  const writtenBooks = await pool.query(query, [authorID]);

  return writtenBooks.rows;
};

module.exports = {
  postAuthor,
  getAllAuthors,
  getAuthor,
  deleteAuthor,
  updateAuthor,
};
