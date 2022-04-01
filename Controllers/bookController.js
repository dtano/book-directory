const {pool} = require('../config/db_setup');
const {Author, Book} = require('../models/');
const {isNullOrEmpty, checkDupEntry, checkArrayContent, checkUniqueness, createUpdateQuery, getBookAuthor, checkAuthorPresence, deleteFile, validateRequestBody} = require('./general');
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
    const [book, created] = await Book.findOrCreate({
      where: queryBody,
    });

    if(!created){
      throw new Error('Duplicate book already exists');
    }

    // Then link the book to the author by creating an entry in the book_author table
    const bookWithAuthors = await linkBookToAuthors(book, req.body.author_ids);

    if (isNullOrEmpty(bookWithAuthors)) {
      throw new Error('Failed to establish a link between book and author(s)');
    }

    res.status(200).json(bookWithAuthors);
  } catch (err) {
    // If there was an error and the request had a file, then delete it
    if (req.file != null) {
      deleteFile(`${bookCoverPath}${req.file.filename}`);
    }
    console.log(err.message);
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
    const authorChange = req.body.authorChange != null ? req.body.authorChange : null;

    if (bookChanges == null && authorChange == null) {
      throw new Error('The request body is not of the correct format');
    }

    // Check if there's a new image sent in the request
    if (req.file != null) {
      // Get entry to update
      const book = await findBook({id: bookId});
      if (isNullOrEmpty(book)) {
        throw new Error(`Book with id = ${bookId} not found`);
      }

      // Delete old picture
      deleteFile(`${bookCoverPath}${book.cover}`);

      // Gotta change the book's cover image with the new filepath
      bookChanges.cover = req.file.filename;
    }

    // Update the general details of the book
    let successfulUpdate = false;

    if (bookChanges != null) {
      await changeBookDetails(bookChanges, bookId);
      successfulUpdate = true;
    }

    if (authorChange != null) {
      // Update the author if the body specified it
      await changeAuthor(bookId, authorChange.authorsToRemove, authorChange.authorsToAdd);
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
    console.log(err.message);
    res.status(400).json(err.message);
  }
};

// Updates the specified book's general details (basically all details except the author)
const changeBookDetails = async (updateBody, bookId) => {
  if (Object.keys(updateBody).length === 0) {
    throw new Error('No details to change are specified');
  }

  const [ rowsUpdated, [updatedBook] ] = await Book.validatedUpdate(updateBody, {returning: true, where: {id: bookId}});
  console.log(updatedBook);

  return updatedBook.dataValues;
};

// A function that allows changing the author(s) of a book
const changeAuthor = async (bookID, authorsToRemove = [], authorsToAdd = []) => {
  // Get the book in question
  const bookToUpdate = await pool.query('SELECT * FROM books WHERE id = ($1)', [bookID]);
  if (isNullOrEmpty(bookToUpdate)) {
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
    const {deleteIDs: bookIdsToDelete} = req.body;
    if (isNullOrEmpty(bookIdsToDelete)) {
      throw new Error('No books to delete');
    }

    const booksToDelete = await Book.findAll({
      where: {
        id: bookIdsToDelete,
      },
      include: Author,
    });

    if(booksToDelete.length != bookIdsToDelete.length){
      // Find the ids that are not legal
      const existingBookIds = booksToDelete.map((book) => book.id);
      const nonExistantBookIds = bookIdsToDelete.filter((id) => !existingBookIds.includes(id));

      res.status(404).json({
        failedIds: nonExistantBookIds,
      });

      return;
    }

    for(const book of booksToDelete)
    {
      if(book.cover != null){
        deleteFile(`${bookCoverPath}${book.cover}`);
      }
      
      await book.destroy();
    }

    res.status(200).json(booksToDelete);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const getBook = async (req, res) => {
  const {id: bookId} = req.params;
  try {
    const book = await findBook({id: bookId});
    
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
    const book = await findBook({id: bookId});

    const isBookDeleted = await Author.destroy({
      where: {
        id: bookId,
      }
    });

    if(!isBookDeleted){
      throw new Error(`Failed to delete book with id: ${bookId}`);
    }

    // Delete cover image here
    const coverPicturePath = book.cover;
    if (coverPicturePath != null) {
      deleteFile(`${bookCoverPath}${coverPicturePath}`);
    }

    res.status(200).json(book);
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

const findBook = async (queryConditions) => {
  const book = await Book.findOne({
    where: queryConditions,
    include: Author,
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
