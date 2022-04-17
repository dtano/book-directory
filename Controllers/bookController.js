const {pool} = require('../config/db_setup');
const {isNullOrEmpty, createUpdateQuery, deleteFile} = require('./general');

const bookValidator = require('../services/validators/bookValidator');
const bookService = require('../services/bookService');

// Creates a new book entry in the database
const postBook = async (req, res) => {
  try {
    await bookValidator.validate(req.body);
    
    // Add the cover image file path to the query body if there is an image attached
    const coverImgName = req.file != null ? req.file.filename : null;
    const queryBody = {
      title: req.body.title,
      pages: req.body.pages,
      date_published: req.body.date_published,
      cover: coverImgName,
    };

    const book = await bookService.createBook(queryBody, req.body.author_ids);

    res.status(200).json(book);
  } catch (err) {
    // If there was an error and the request had a file, then delete it
    if (req.file != null) {
      deleteFile(`${bookCoverPath}${req.file.filename}`);
    }
    res.status(400).json(err.message);
  }
};

// Update book entry with the values in the request body
const updateBook = async (req, res) => {
  const {id: bookId} = req.params;
  try {
    if (isNullOrEmpty(req.body)) {
      throw new Error('The body is empty');
    }

    // Use the one below if cover image uploads is included with the other details
    // var bookChanges = req.body.bookChanges != null ? JSON.parse(req.body.bookChanges) : null;
    // var authorChange = req.body.authorChange != null ? JSON.parse(req.body.authorChange) : null;

    // Use this if cover image upload is handled somewhere else
    const bookChanges = req.body.bookChanges != null ? req.body.bookChanges : null;
    const authorChanges = req.body.authorChanges != null ? req.body.authorChanges : null;

    if (bookChanges == null && authorChanges == null) {
      throw new Error('The request body is not of the correct format');
    }

    if (req.file != null) {
      bookChanges.cover = req.file.filename;
    }

    const {book, previousBookValues} = await bookService.updateBook(bookId, bookChanges, authorChanges);

    res.status(200).json(book);
  } catch (err) {
    // If update was unsuccessful, then we'll need to delete any uploaded file
    if (req.file != null) {
      deleteFile(`${bookCoverPath}${req.file.filename}`);
    }
    console.log(err.message);
    res.status(400).json(err.message);
  }
};

// Delete specified book entries from the database
const deleteMultipleBooks = async (req, res) => {
  try {
    const {deleteIDs: bookIdsToDelete} = req.body;
    const deleteConfirmation = await bookService.deleteMultipleBooks(bookIdsToDelete);
    
    if(!deleteConfirmation.status){
      res.status(404).json({
        nonExistantBookIds: deleteConfirmation.body,
      });
      return;
    }

    res.status(200).json(deleteConfirmation.body);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const getBook = async (req, res) => {
  const {id: bookId} = req.params;
  try {
    const book = await bookService.findBook({id: bookId});
    
    if (isNullOrEmpty(book)) {
      throw new Error(`Book with id = ${bookId} not found`);
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const deleteBook = async (req, res) => {
  const {id: bookId} = req.params;
  try {
    const book = await bookService.deleteBook(bookId);

    res.status(200).json(book);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Returns all of the book entries
// On error, it simply returns a blank array
const getAllBooks = async (req, res) => {
  try {
    const allBooks = await bookService.findAllBooks();
    
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Attaches new cover image name to the specified book
const uploadCoverImage = async (req, res) => {
  const {id} = req.params;
  try {
    // Get the book in question
    const book = await pool.query('SELECT * FROM books WHERE id = ($1)', [id]);
    if (book.rows.length == 0) {
      throw new Error(`Book with id = ${id} not found`);
    }

    // Update the book with the new cover image
    const newCover = req.file != null ? req.file.filename : null;

    const {query, values} = createUpdateQuery('books', {id: id}, {cover: newCover});
    const updatedEntry = await pool.query(query, values);

    if (updatedEntry.rows.length == 0) {
      throw new Error('Failed to update the cover image of this book ' + id);
    }

    // Delete old cover image
    if (book.rows[0].cover != null) deleteFile(`${bookCoverPath}${book.rows[0].cover}`);

    res.status(200).json(updatedEntry.rows[0]);
  } catch (err) {
    deleteFile(`${bookCoverPath}${req.file.filename}`);
    res.status(400).json(err.message);
  }
};

module.exports = {
  postBook,
  updateBook,
  deleteBook,
  deleteMultipleBooks,
  getBook,
  getAllBooks,
  uploadCoverImage,
};
