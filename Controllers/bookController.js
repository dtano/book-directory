const {pool} = require('../config/db_setup');
const {Author, Book} = require('../models/');
const {isNullOrEmpty, checkDupEntry, checkArrayContent, checkUniqueness, createUpdateQuery, getBookAuthor, checkAuthorPresence, deleteFile} = require('./general');
const format = require('pg-format');
const path = require('path');

const bookCoverPath = path.join(__dirname, '../public/uploads/bookCovers/');
const expectedRequestKeys = ['title', 'pages', 'date_published', 'cover', 'author_ids'];

// Creates a new book entry in the database
const postBook = async (req, res) => {
  try {
    // Check if author is specified
    if (!validateBookRequestBody(req.body)) {
      throw new Error('No author(s) specified');
    }

    // This assumes that author_id is an array of IDs
    [allAuthorsExist, authors] = await checkAuthorPresence(req.body.author_ids);
    if (!allAuthorsExist) {
      throw new Error('At least one of the specified authors does not exist in the database');
    }

    // Need to look for duplicates
    if (await checkDupEntry(req.body, 'books')) {
      throw new Error('The given entry already exists in the database');
    }

    // Add the cover image file path to the query body if there is an image attached
    const coverImgName = req.file != null ? req.file.filename : null;
    const queryBody = {
      title: req.body.title,
      pages: req.body.pages,
      date_published: req.body.date_published,
      cover: coverImgName,
    };

    // Create book instance
    // Might have to tweak this somehow
    const [row, created] = await Book.findOrCreate({
      where: queryBody,
    });

    if(!created){
      throw new Error('Duplicate author entry');
    }

    // Then link the book to the author by creating an entry in the book_author table
    // const bookAuthorLink = await linkBookToAuthor(newBook.rows[0].id, req.body.author_id);
    const bookWithAuthors = await linkBookToAuthors(row, req.body.author_ids);

    if (isNullOrEmpty(bookWithAuthors)) {
      throw new Error('Failed to establish a link between book and author(s)');
    }

    res.status(200).json(bookWithAuthors);
  } catch (err) {
    // If there was an error and the request had a file, then delete it
    if (req.file != null) {
      deleteFile(`${bookCoverPath}${req.file.filename}`);
    }
    res.status(400).json(err.message);
  }
};

// Use this to link multiple authors to a book
const linkBookToAuthors = async (book, authorIds) => {
  // Now we need to make nested array that contains book_id and author_ids
  if (authorIds.length === 0) {
    return {};
  }

  let authors = [];
  for(const authorId of authorIds){
    const author = await Author.findOne({
      where: {
        id: authorId
      }
    });

    if(!isNullOrEmpty(author)){
      authors.push(author);
    }
  }

  await book.setAuthors(authors);

  const bookWithAuthors = await Book.findOne({
    where: {id: book.id},
    include: Author,
  });

  return bookWithAuthors;
};

// Remove one or more authors from the given book
const removeAuthorsFromBook = async (bookID, authorsToRemove) => {
  if (authorsToRemove.length === 0) {
    return {};
  }

  const query = format(`DELETE FROM book_author WHERE book_id = ${bookID} AND author_id IN (%L) RETURNING *`, authorsToRemove);
  const removed = await pool.query(query, []);

  return removed;
};

// Update book entry with the values in the request body
const updateBook = async (req, res) => {
  const {id} = req.params;
  try {
    if (isNullOrEmpty(req.body)) {
      throw new Error('The body is empty');
    }

    // Use the one below if cover image uploads is included with the other details
    // var bookChanges = req.body.bookChanges != null ? JSON.parse(req.body.bookChanges) : null;
    // var authorChange = req.body.authorChange != null ? JSON.parse(req.body.authorChange) : null;

    // Use this if cover image upload is handled somewhere else
    const bookChanges = req.body.bookChanges != null ? req.body.bookChanges : null;
    const authorChange = req.body.authorChange != null ? req.body.authorChange : null;

    if (bookChanges == null && authorChange == null) {
      throw new Error('The request body is not of the correct format');
    }

    // Check if there's a new image sent in the request
    if (req.file != null) {
      // Get entry to update
      const book = await pool.query('SELECT * FROM books WHERE id = ($1)', [id]);
      if (book.rows.length == 0) {
        throw new Error(`Book with id = ${id} not found`);
      }

      // Delete old picture
      deleteFile(`${bookCoverPath}${book.rows[0].cover}`);

      // Gotta change the book's cover image with the new filepath
      bookChanges.cover = req.file.filename;
    }

    // Update the general details of the book
    let successfulUpdate = false;

    if (bookChanges != null) {
      await changeBookDetails(bookChanges, id);
      successfulUpdate = true;
    }

    if (authorChange != null) {
      // Update the author if the body specified it
      await changeAuthor(id, authorChange.authorsToRemove, authorChange.authorsToAdd);
      // console.log("Author changed");
      successfulUpdate = true;
    }

    if (successfulUpdate) {
      // Can't return this if its just the author that is changed
      res.status(200).json('Successful update');
    } else {
      res.status(400).json('The request body contains the wrong keys');
    }
  } catch (err) {
    // If update was unsuccessful, then we'll need to delete any uploaded file
    if (req.file != null) {
      deleteFile(`${bookCoverPath}${req.file.filename}`);
    }
    res.status(400).json(err.message);
  }
};

// Updates the specified book's general details (basically all details except the author)
const changeBookDetails = async (updateBody, bookID) => {
  if (Object.keys(updateBody).length === 0) {
    throw new Error('No details to change are specified');
  }

  const {query, values} = createUpdateQuery('books', {id: bookID}, updateBody);
  const updatedEntry = await pool.query(query, values);

  return updatedEntry.rows;
};

// A function that allows changing the author(s) of a book
const changeAuthor = async (bookID, authorsToRemove = [], authorsToAdd = []) => {
  // Get the book in question
  const bookToUpdate = await pool.query('SELECT * FROM books WHERE id = ($1)', [bookID]);
  if (bookToUpdate.rows.length == 0) {
    throw new Error(`Book with id = ${bookID} not found`);
  };

  // Get the author(s) of the book
  const bookAuthors = await getBookAuthor(bookID);
  const bookAuthorIDs = bookAuthors.map((author) => author.id);

  // Checks whether all ids in authorsToRemove is present in the array of authors for this book
  if (authorsToRemove.length > 0 && !checkArrayContent(bookAuthorIDs, authorsToRemove)) {
    throw new Error('Invalid author ids to remove');
  }

  // Verify whether the author ids to add are authors that exist in the database
  if (authorsToAdd.length > 0) {
    // Look for the author in the authors table using their id
    const authorValid = await checkAuthorPresence(authorsToAdd);
    console.log(authorValid);
    // Make sure that none of the authors are already credited with writing this book

    if (!authorValid) {
      throw new Error('At least one of the authors to add don\'t exist in the database');
    }

    // If at least one of the given authors to add has been credited with writing this book, then you can't add these authors
    if (!checkUniqueness(bookAuthorIDs, authorsToAdd)) {
      throw new Error('At least one of the authors is already credited with writing this book');
    }
  }

  // Delete corresponding book_author entry
  const removed = await removeAuthorsFromBook(bookID, authorsToRemove);

  // Create new entries in the book_author table
  const added = await linkBookToAuthors(bookID, authorsToAdd);

  return {
    removed: removed.rows,
    added: added.rows,
  };
};


// Update author route
/*
    body = {
        authorsToRemove: [],
        authorsToAdd: []
    }
*/
const updateBookAuthor = async (req, res) => {
  const {id} = req.params;
  try {
    const updatedBook = await changeAuthor(id, req.body.authorsToRemove, req.body.authorsToAdd);

    // Send to response
    res.status(200).json(updatedBook);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Delete specified book entries from the database
const deleteMultipleBooks = async (req, res) => {
  try {
    // req.body should hold a list of ids to delete
    const {deleteIDs} = req.body;
    if (!deleteIDs || deleteIDs.length === 0) {
      throw new Error('No ids to delete');
    }
    // Map the ids into its '$' numbers for the database query
    const delTupes = deleteIDs.map((id, index) => `$${index + 1}`);
    const objsToDelete = delTupes.join(', ');

    const delQuery = `DELETE FROM books WHERE id IN (${objsToDelete}) RETURNING *`;
    const removed = await pool.query(delQuery, deleteIDs);

    // This means that the given ids don't exist
    if (removed.rows.length == 0) {
      throw new Error(`The given ids were not deleted ${ deleteIDs }`);
    } else if (removed.rows.length != deleteIDs.length) {
      // Find out which entry was not deleted
      const success = removed.rows.map((entry) => entry.book_id);
      const failed = deleteIDs.filter((id) => !success.includes(id));
      res.status(404).json({
        entriesDeleted: success,
        failedDeletes: failed,
      });
    } else {
      res.status(200).json(removed.rows);
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const getBook = async (req, res) => {
  const {id: bookId} = req.params;
  try {
    const book = await findBookWithId(bookId);
    
    if (isNullOrEmpty(book)) {
      throw new Error(`Book with id = ${bookId} not found`);
    }

    res.status(200).json(book);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const deleteBook = async (req, res) => {
  const {id} = req.params;
  try {
    const deletedEntry = await pool.query('DELETE FROM books WHERE id = ($1) RETURNING *', [id]);
    if (deletedEntry.rows.length == 0) {
      throw new Error(`There is possibly no entry with id = ${id}`);
    }

    // Delete cover image here
    if (deletedEntry.rows[0].cover != null) {
      deleteFile(`${bookCoverPath}${deletedEntry.rows[0].cover}`);
    }

    res.status(200).json(deletedEntry.rows[0]);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Returns all of the book entries
// On error, it simply returns a blank array
const getAllBooks = async (req, res) => {
  try {
    const allBooks = await Book.findAll({
      include: Author,
    });
    
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
    console.log(newCover);

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

const findBookWithId = async (bookId) => {
  const book = await Book.findOne({
    where: {
      id: bookId,
    },
    include: Author
  });

  return book;
}

const validateBookRequestBody = (body) => {
  let isValid = true;
  let areAuthorsSpecified = false;
  Object.keys(body).forEach(key => {
    // Find whether key exists in specified key list
    if(!expectedRequestKeys.includes(key)) isValid = false;

    if(key == 'author_ids') areAuthorsSpecified = true;
  });

  return isValid && areAuthorsSpecified;
}

module.exports = {
  postBook,
  updateBook,
  deleteBook,
  deleteMultipleBooks,
  getBook,
  getAllBooks,
  uploadCoverImage,
  updateBookAuthor,
};
