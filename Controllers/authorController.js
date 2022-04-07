const {Author, Book} = require('../models/');
const {isEmpty, isNullOrEmpty, deleteFile} = require('./general');
const path = require('path');

// Where images will be stored in the project directory
const authorImgPath = path.join(__dirname, '../public/uploads/authors/');

const expectedRequestKeys = ['given_names', 'surname', 'country_origin', 'bio', 'profile_picture'];
const notNullableColumns = ['given_names', 'surname'];


// Create a new author entry
const postAuthor = async (req, res) => {
  try {
    if(isNullOrEmpty(req.body)) throw new Error('Request body is empty');
    
    // Add the author image file path to the query body if there is an image attached
    const authorImg = {profile_picture: req.file != null ? req.file.filename : null};
    req.body.profile_picture = authorImg.profile_picture;

    // Need to validate request body
    if(!validateAuthorRequestBody(req.body)) throw new Error('Request body contains an invalid key');

    // Might have to tweak this somehow
    const [row, created] = await Author.findOrCreate({
      where: req.body,
    });

    if(!created){
      throw new Error('Duplicate author entry');
    }
    
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
    const authors = await Author.findAll({
      include: Book,
    });

    res.status(200).json(authors);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

// Gets specified author
const getAuthor = async (req, res) => {
  const {id: authorId} = req.params;
  try {
    const author = await findAuthor({id: authorId});
    
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
    if(isEmpty(req.body)){
      throw new Error(`Request body is empty`);
    }

    // Need to validate request body
    if(!validateAuthorRequestBody(req.body)) throw new Error('Request body is not valid');
    
    // Get entry to update
    const author = await findAuthor({id: authorId});
    
    if (req.file != null) {
      deleteProfilePicture(author.profile_picture);
      // Gotta change the author's profile picture with the new filepath
      req.body.profile_picture = req.file.filename;
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
    const author = await findAuthor({id: authorId});

    const numDeletedEntries = await Author.destroy({
      where: {
        id: authorId,
      },
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

const findAuthor = async (queryConditions) => {
  // Get entry to update
  const author = await Author.findOne({
    where: queryConditions,
    include: Book,
  });

  return author;
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

const deleteProfilePicture = (profilePicturePath) => {
  if(profilePicturePath != null){
    deleteFile(`${authorImgPath}${profilePicturePath}`);
  }
}

module.exports = {
  postAuthor,
  getAllAuthors,
  getAuthor,
  deleteAuthor,
  updateAuthor,
};
