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
const coverImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads/bookCovers")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    },
})
const coverUpload = multer({
    storage: coverImageStorage,
    limits: {fieldSize: 10 * 1024 * 1024}
});
    // destination: (req, file, cb) => {
    //     cb(null, "./public/uploads/bookCovers")
    // },
    // // fileFilter: (req, file, callback) => {
    // //     callback(null, imageMimeTypes.includes(file.mimetype));
    // //     // What if we get a file that is not of the correct format?
    // // },
    // filename: (req, file, cb) => {
    //     cb(null, Date.now() + "--" + file.originalname)
    // },
    // limits: {fileSize: maxImageSize}

const authorUpload = multer({
    destination: authorUploadPath,
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