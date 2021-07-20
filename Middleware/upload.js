const multer = require("multer");
const path = require("path");

// What types of files are accepted
const imageMimeTypes = ["images/jpeg", "images/png"];
const maxImageSize = 10 * 1024 * 1024;

// Where images will be stored in the project directory
// const coverUploadPath = path.join("public", "uploads/bookCovers");
// const authorUploadPath = path.join("public", "uploads/authors");

// The middleware for book cover photo uploads
const coverImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/bookCovers")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    },
})

const authorProfilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/authors");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    },
})

const coverUpload = multer({
    storage: coverImageStorage,
    // fileFilter: (req, file, cb) => {
    //     cb(null, imageMimeTypes.includes(file.mimetype));
    // },
    limits: {fieldSize: maxImageSize}
});

const authorUpload = multer({
    storage: authorProfilePicStorage,
    fileFilter: (req, file, cb) => {
        cb(null, imageMimeTypes.includes(file.mimetype));
    },
    limits: {fieldSize: maxImageSize}
});
module.exports = {
    coverUpload,
    authorUpload
}