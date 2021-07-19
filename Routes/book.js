const express = require("express");
// const multer = require("multer");
const fs = require("fs");
// This module helps create unique IDs
const crypto = require("crypto");
const { captureRejectionSymbol } = require("events");
const { coverUpload } = require("../Middleware/upload");

const multer = require("multer");

const router = express.Router();
const {postBook, getAllBooks, updateBook, deleteBook, deleteMultipleBooks, getBook} = require("../Controllers/bookController");

// Adds a book to the database (A json file at the moment)
router.post("/", coverUpload.single("cover"), async (req, res) => {
    // Create a new book entry
    //req.body = JSON.parse(JSON.stringify(req.body));
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

// const exampleStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./public/uploads/bookCovers")
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "--" + file.originalname)
//     }
// });

// const exampleUpload = multer({storage: exampleStorage})


// router.post("/example", coverUpload.single("cover"), async (req, res) => {
//     if(req.file == null){
//         res.send("What the fuck")
//     }else{
//         console.log(req.file);
//         res.send(req.file.filename);
//     }   
// })



module.exports = router;