const multer = require("multer");
const path = require("path");

// What types of files are accepted
const imageMimeTypes = ["images/jpeg", "images/png"];
const maxImageSize = 5 * 1024 * 1024;

// Where images will be stored in the project directory
const coverUploadPath = path.join("public", "uploads/bookCovers");
const authorUploadPath = path.join("public", "uploads/authors");

// The middleware for book cover photo uploads
// const makeUploadMiddleware = (filepath, maxSize=maxImageSize) => {
//     return multer({
//         dest: filepath,
//         fileFilter: (req, file, callback) => {
//             callback(null, imageMimeTypes.includes(file.mimetype));
//             // What if we get a file that is not of the correct format?
//         },
//         limits: {fileSize: maxSize}
//     });
// }
const coverUpload = multer({
    dest: coverUploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
        // What if we get a file that is not of the correct format?
    },
    limits: {fileSize: maxImageSize}
});

const authorUpload = multer({
    dest: authorUploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
        // What if we get a file that is not of the correct format?
    },
    limits: {fileSize: maxImageSize}
});
module.exports = {
    coverUpload,
    authorUpload
}