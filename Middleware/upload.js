const multer = require('multer');

// What types of files are accepted
const imageMimeTypes = ['image/jpeg', 'image/png'];
const maxImageSize = 10 * 1024 * 1024;

const createStorage = (dest, isTest = false) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '--' + file.originalname);
    },
  });
};

// Creates the multer object where storage, file filter and limits are specified
const createMulterObject = (multerStorage) => {
  return multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {
      if (!imageMimeTypes.includes(file.mimetype)) {
        req.fileValidationError = `Only image files allowed. Given file is of type ${file.mimetype}`;
        return cb(null, false, new Error(req.fileValidationError));
      }
      cb(null, true);
    },
    limits: {fieldSize: maxImageSize},
  });
};

const imageUpload = (destination) => {
  const diskStorage = createStorage(destination);
  
  return createMulterObject(diskStorage);
}

module.exports = {
  imageUpload,
};
