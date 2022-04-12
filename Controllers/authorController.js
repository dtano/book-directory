const authorService = require('../services/authorService');
const {isEmpty, isNullOrEmpty, deleteFile} = require('./general');
const path = require('path');

// Where images will be stored in the project directory
const authorImgPath = path.join(__dirname, '../public/uploads/authors/');

const notNullableColumns = ['given_names', 'surname'];
const expectedRequestKeys = [...notNullableColumns, 'country_origin', 'bio', 'profile_picture'];


// Create a new author entry
const postAuthor = async (req, res) => {
  try {
    if(isNullOrEmpty(req.body)) throw new Error('Request body is empty');
    
    // Add the author image file path to the query body if there is an image attached
    const authorImg = {profile_picture: req.file != null ? req.file.filename : null};
    req.body.profile_picture = authorImg.profile_picture;

    const createdAuthor = await authorService.createAuthor(req.body);
    
    res.status(200).json(createdAuthor.toJSON());
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
    const authors = await authorService.findAllAuthors();

    if(authors.length == 0) {
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
    if(isEmpty(req.body)) throw new Error(`Request body is empty`);

    if(!validateAuthorRequestBody(req.body)) throw new Error('Request body is not valid');
    
    if (req.file != null) req.body.profile_picture = req.file.filename;

    const {updatedAuthor, previousValues} = await authorService.updateAuthor(authorId, req.body);

    deleteProfilePicture(previousValues.profile_picture);
    
    res.status(200).json(updatedAuthor.toJSON());
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Deletes author with given id if it exists
const deleteAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    const {author, numDeletedEntries} = await authorService.deleteAuthor(authorId);
    
    if (numDeletedEntries == 0) {
      throw new Error(`Failed to delete entry with id = ${authorId}`);
    }

    if (author.profile_picture != null) {
      deleteFile(`${authorImgPath}${profilePicturePath}`);
    }

    res.status(200).json(`Successfully deleted author with id: ${authorId}`);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const deleteProfilePicture = (profilePicturePath) => {
  if(profilePicturePath != null){
    deleteFile(`${authorImgPath}${profilePicturePath}`);
  }
}

const validateAuthorRequestBody = (body) => {
  const bodyKeys = Object.keys(body);
  
  for(const key of bodyKeys){
    if(!expectedRequestKeys.includes(key)) return false;

    if(notNullableColumns.includes(key) && isNullOrEmpty(body[key])){
      // Now we need to make sure that the value is not empty or null
      return false;
    }
  }

  return true;
}

module.exports = {
  postAuthor,
  getAllAuthors,
  getAuthor,
  deleteAuthor,
  updateAuthor,
};
