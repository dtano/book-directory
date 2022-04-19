const express = require('express');
const router = express.Router();
const env = process.env.NODE_ENV || 'development';

const {postBook, getAllBooks, updateBook, deleteBook, deleteMultipleBooks,
  getBook} = require('../controllers/bookController');
const {imageUpload} = require('../middleware/upload');
const {attachCover} = require('../middleware/fileRequestBodyAttacher');
const {coverUploadPath} = require('../config/config')[env].imageUploadPaths;

const uploadCoverPicture = imageUpload(coverUploadPath).single('cover');

// Adds a book to the database
router.post('/', uploadCoverPicture, attachCover, async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }
  // Create a new book entry
  await postBook(req, res);
});

// Gets all listed books
router.get('/', async (req, res) => {
  await getAllBooks(req, res);
});

router.get('/example', uploadCoverPicture, attachCover, (req, res) => {
  const bookChanges = JSON.parse(req.body.bookChanges);

  if (req.file != null) {
    bookChanges.cover = req.file.filename;
  }
});

router.put('/cover/:id', uploadCoverPicture, async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }
  await uploadCoverImage(req, res);
});

// Updates the specified entry
router.put('/:id', uploadCoverPicture, attachCover, async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }
  await updateBook(req, res);
});

// Get book with specified id
router.get('/:id', async (req, res) => {
  await getBook(req, res);
});

// Delete multiple entries
router.delete('/multiple', async (req, res) => {
  await deleteMultipleBooks(req, res);
});

// Delete single entry
router.delete('/:id', async (req, res) => {
  await deleteBook(req, res);
});


module.exports = router;
