const authorService = require('../services/authorService');
const {isEmpty, isNullOrEmpty} = require('./general');

// Create a new author entry
const postAuthor = async (req, res) => {
  try {
    if(isNullOrEmpty(req.body)) throw new Error('Request body is empty');
    
    console.log(req.file);
    // Add the author image file path to the query body if there is an image attached
    //req.body.profile_picture = req.file != null ? req.file.filename : null;

    const createdAuthor = await authorService.createAuthor(req.body);
    
    res.status(200).json(createdAuthor.toJSON());
  } catch (err) {
    if (req.file != null) authorService.deleteProfilePicture(req.file.filename);
    res.status(400).json(err.message);
  }
};

// Returns all author entries to client
const getAllAuthors = async (req, res) => {
  try {
    const authors = await authorService.findAllAuthors();

    if(authors.length === 0) {
      res.status(404).send('No authors with specified conditions found');
      return;
    }

    res.status(200).json(authors);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Gets specified author
const getAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    const author = await authorService.findAuthor({id: authorId});
    
    if (isNullOrEmpty(author)) {
      throw new Error(`author with id = ${authorId} not found`);
    }

    res.status(200).json(author);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Updates author entry with given data
const updateAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    console.log(req.file);
    if(isEmpty(req.body)) throw new Error(`Request body is empty`);

    const {updatedAuthor, previousValues} = await authorService.updateAuthor(authorId, req.body);

    res.status(200).json(updatedAuthor.toJSON());
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Deletes author with given id if it exists
const deleteAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    const {author: deletedAuthor, numDeletedEntries} = await authorService.deleteAuthor(authorId);

    res.status(200).json(`Successfully deleted author with id: ${authorId}`);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

module.exports = {
  postAuthor,
  getAllAuthors,
  getAuthor,
  deleteAuthor,
  updateAuthor,
};
