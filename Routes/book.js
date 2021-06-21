const express = require("express");
const fs = require("fs");
// This module helps create unique IDs
const crypto = require("crypto");
const { captureRejectionSymbol } = require("events");

const router = express.Router();
const {postBook, getAllBooks, updateBook, deleteBook, deleteMultipleBooks, getBook} = require("../Controllers/bookController");

// Adds a book to the database (A json file at the moment)
router.post("/", async (req, res) => {
    // Create a new book entry
    await postBook(req, res);
});

// Gets all listed books
router.get("/", async (req, res) => {
    await getAllBooks(req, res);
});

// Updates the specified entry
router.put("/:id", async (req, res) => {
    await updateBook(req, res);
});

// Get book with specified id
router.get("/:id", async (req, res) => {
    await getBook(req, res);
});

// Delete multiple entries
router.delete("/multiple", async (req, res) => {
    await deleteMultipleBooks(req, res);
});

// Delete single entry
router.delete("/:id", async (req, res) => {
    await deleteBook(req, res);
});



module.exports = router;