const express = require('express');
const {coverUpload, createUploadMiddleware} = require('../middleware/upload');

const router = express.Router();
const {postBook, getAllBooks, updateBook, deleteBook, deleteMultipleBooks,
  getBook, uploadCoverImage} = require('../controllers/bookController');

// Adds a book to the database
router.post('/', coverUpload.single('cover'), async (req, res) => {
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

router.get('/example', coverUpload.single('cover'), (req, res) => {
  const bookChanges = JSON.parse(req.body.bookChanges);

  if (req.file != null) {
    bookChanges.cover = req.file.filename;
  }

  console.log(bookChanges);

  res.json('Kiss me more');
});

router.put('/cover/:id', coverUpload.single('cover'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }
  await uploadCoverImage(req, res);
});

router.put('/test/cover/:id', createUploadMiddleware('book', true).single('cover'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }
  await uploadCoverImage(req, res);
});

// Updates the specified entry
router.put('/:id', coverUpload.single('cover'), async (req, res) => {
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
