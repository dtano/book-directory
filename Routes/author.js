const express = require('express');
const router = express.Router();
const env = process.env.NODE_ENV || 'development';

const {postAuthor, getAllAuthors, getAuthor, deleteAuthor, updateAuthor} = require('../controllers/authorController');
const {imageUpload} = require('../middleware/upload');
const {attachProfilePicture} = require('../middleware/fileRequestBodyAttacher');
const {authorProfilePicturePath} = require('../config/config.js')[env].imageUploadPaths;

const uploadProfilePicture = imageUpload(authorProfilePicturePath).single('profile-picture');
// Post author
router.post('/', uploadProfilePicture, attachProfilePicture, async (req, res) => {
  await postAuthor(req, res);
});

// Get all authors
router.get('/', async (req, res) => {
  await getAllAuthors(req, res);
});

// Get specified author
router.get('/:id', async (req, res) => {
  await getAuthor(req, res);
});

// Delete author
router.delete('/:id', async (req, res) => {
  await deleteAuthor(req, res);
});

// Update author
router.put('/:id', uploadProfilePicture, attachProfilePicture, async (req, res) => {
  await updateAuthor(req, res);
});

module.exports = router;
