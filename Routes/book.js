const express = require("express");
// const multer = require("multer");
const fs = require("fs");
// This module helps create unique IDs
const crypto = require("crypto");
const { captureRejectionSymbol } = require("events");
const { coverUpload } = require("../Middleware/upload");

const router = express.Router();
const {postBook, getAllBooks, updateBook, deleteBook, deleteMultipleBooks, getBook, uploadCoverImage} = require("../Controllers/bookController");

// Adds a book to the database (A json file at the moment)
router.post("/", coverUpload.single("cover"), async (req, res) => {
    if(req.fileValidationError){
        return res.status(400).send(req.fileValidationError)
    }
    // Create a new book entry
    await postBook(req, res);
});

// Gets all listed books
router.get("/", async (req, res) => {
    await getAllBooks(req, res);
});

router.get("/example", coverUpload.single("cover"), (req, res) => {
    var bookChanges = JSON.parse(req.body.bookChanges);
    
    if(req.file != null){
        bookChanges.cover = req.file.filename;
    }

    console.log(bookChanges);

    res.json("Kiss me more");
})

router.put("/cover/:id", coverUpload.single("cover"), async (req, res) => {
    if(req.fileValidationError){
        return res.status(400).send(req.fileValidationError)
    }
    await uploadCoverImage(req, res);
})

// Updates the specified entry
router.put("/:id", coverUpload.single("cover"), async (req, res) => {
    if(req.fileValidationError){
        return res.status(400).send(req.fileValidationError)
    }
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

// router.get("/example", (req, res) => {
//     let allData = JSON.parse(fs.readFileSync("Routes/movies.json"));

//     console.log(allData);
//     res.json("Inshallah");
// })

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