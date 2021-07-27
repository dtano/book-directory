const multer = require("multer");
const path = require("path");

// What types of files are accepted
const imageMimeTypes = ["image/jpeg", "image/png"];
const maxImageSize = 10 * 1024 * 1024;

// Where images will be stored in the project directory
// const coverUploadPath = path.join("public", "uploads/bookCovers");
// const authorUploadPath = path.join("public", "uploads/authors");

const coverUploadPath = "./public/uploads/bookCovers";
const authorProfilePicPath = "./public/uploads/authors";

const coverUploadPathTest = "./test/testUploads/bookCovers";
const authorProfilePicPathTest = "./public/testUploads/authors";

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


const createStorage = (dest, isTest = false) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            // if(isTest){
            //     cb(null, `${dest}Test`);
            // }else{
            //     cb(null, dest);
            // }
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "--" + file.originalname);
        }
    });
}

// A function that creates a multer middleware based on the given option
const createUploadMiddleware = (option, isTest = false) => {
    switch(option){
        case "book":
            if(isTest){
                return createMulterObject(createStorage(coverUploadPathTest, isTest));
            }
            return createMulterObject(createStorage(coverUploadPath, isTest));
        case "author":
            if(isTest){
                return createMulterObject(createStorage(authorProfilePicPathTest, isTest));
            }
            return createMulterObject(createStorage(authorProfilePicPath, isTest));
        default: 
            console.log("Given option is wrong");
    }
    return null;
}

// Creates the multer object where storage, file filter and limits are specified
const createMulterObject = (multerStorage) => {
    return multer({
        storage: multerStorage,
        fileFilter: (req, file, cb) => {
            if(!imageMimeTypes.includes(file.mimetype)){
                req.fileValidationError = `Only image files allowed. Given file is of type ${file.mimetype}`;
                return cb(null, false, new Error(req.fileValidationError));
            }
            cb(null, true);
        },
        limits: {fieldSize: maxImageSize}
    });
    
}

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
    fileFilter: (req, file, cb) => {
        if(!imageMimeTypes.includes(file.mimetype)){
            req.fileValidationError = `Only image files allowed. Given file is of type ${file.mimetype}`;
            return cb(null, false, new Error(req.fileValidationError));
        }
        cb(null, true);
    },
    limits: {fieldSize: maxImageSize}
});
module.exports = {
    coverUpload,
    authorUpload,
    createUploadMiddleware
}