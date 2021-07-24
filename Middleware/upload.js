const multer = require("multer");
const path = require("path");

// What types of files are accepted
const imageMimeTypes = ["image/jpeg", "image/png"];
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
    fileFilter: (req, file, cb) => {
        if(!imageMimeTypes.includes(file.mimetype)){
            req.fileValidationError = `Only image files allowed. Given file is of type ${file.mimetype}`;
            return cb(null, false, new Error(req.fileValidationError));
        }
        cb(null, true);
    },
    limits: {fieldSize: maxImageSize}
});

const authorUpload = multer({
    storage: authorProfilePicStorage,
    // fileFilter: (req, file, cb) => {
    //     cb(null, imageMimeTypes.includes(file.mimetype));
    // },
    limits: {fieldSize: maxImageSize}
});
module.exports = {
    coverUpload,
    authorUpload
}