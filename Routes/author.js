const express = require('express');
const router = express.Router();
const {postAuthor, getAllAuthors, getAuthor, deleteAuthor, updateAuthor} = require('../controllers/authorController');

const {authorUpload} = require('../middleware/upload');
const {attachProfilePicture} = require('../middleware/fileRequestBodyAttacher');

// Post author
router.post('/', authorUpload.single('profile-picture'), attachProfilePicture, async (req, res) => {
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
router.put('/:id', authorUpload.single('profile-picture'), attachProfilePicture, async (req, res) => {
  await updateAuthor(req, res);
});

module.exports = router;
