const {pool} = require('../config/db_setup');
const {Author} = require('../models/');
const {isEmpty, isNullOrEmpty, createUpdateQuery, deleteFile} = require('./general');
const path = require('path');

// Where images will be stored in the project directory
const authorImgPath = path.join(__dirname, "../public/uploads/authors/");
//const authorImgPath = './public/uploads/authors/';


// Create a new author entry
const postAuthor = async (req, res) => {
  try {
    if(isNullOrEmpty(req.body)) throw new Error('Request body is empty');
    // Add the author image file path to the query body if there is an image attached
    const authorImg = {profile_picture: req.file != null ? req.file.filename : null};
    req.body.profile_picture = authorImg.profile_picture;

    // Might have to tweak this somehow
    const [row, created] = await Author.findOrCreate({
      where: req.body,
    });

    if(!created){
      throw new Error('Duplicate author entry');
    }

    row.bio = req.body.bio;
    row.profile_picture = req.body.profile_picture;
    await row.save();
    
    res.status(200).json(row.toJSON());
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
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Gets specified author
const getAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    const responseBody = {};
    const author = await findAuthorWithId(authorId);
    
    if (isNullOrEmpty(author)) {
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
  const {id: authorId} = req.params;
  try {
    if(isEmpty(req.body)){
      throw new Error(`Request body is empty`);
    }
    
    // Get entry to update
    const author = await findAuthorWithId(authorId);
    
    if (req.file != null) {
      // Delete old picture
      deleteFile(`${authorImgPath}${author.rows[0].cover}`);
      // Gotta change the book's cover image with the new filepath
      req.body.cover = req.file.filename;
    }

    const [ rowsUpdated, [updatedAuthor] ] = await Author.update(req.body, {returning: true, where: {id: authorId}});
    if(rowsUpdated == 0){
      throw new Error(`Failed to update author with id = ${authorId}`);
    }
    
    res.status(200).json(updatedAuthor.toJSON());
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Deletes author with given id if it exists
const deleteAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    const author = await findAuthorWithId(authorId);

    const numDeletedEntries = await Author.destroy({
      where: {
        id: authorId,
      }
    });
    
    if (numDeletedEntries == 0) {
      throw new Error(`Failed to delete entry with id = ${authorId}`);
    }

    const profilePicturePath = author.profile_picture;
    if (profilePicturePath != null) {
      deleteFile(`${authorImgPath}${profilePicturePath}`);
    }
    res.status(200).json(`Successfully deleted author with id: ${authorId}`);
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

const findAuthorWithId = async (authorId) => {
  // Get entry to update
  const author = await Author.findOne({where: {id: authorId}});
  if (isNullOrEmpty(author)) {
    throw new Error(`Author with id = ${authorId} not found`);
  }

  return author;
}

module.exports = {
  postAuthor,
  getAllAuthors,
  getAuthor,
  deleteAuthor,
  updateAuthor,
};
