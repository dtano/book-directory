require('dotenv').config();

const {PGUSER, PGHOST, PGPASSWORD, PGDATABASE} = process.env;

module.exports = {
  'development': {
    'username': PGUSER,
    'password': PGPASSWORD,
    'database': PGDATABASE,
    'host': PGHOST,
    'dialect': 'postgres',
    'imageUploadPaths': {
      'coverUploadPath': './public/uploads/bookCovers',
      'authorProfilePicturePath': './public/uploads/authors',
    }
  },
  'test': {
    'username': PGUSER,
    'password': PGPASSWORD,
    'database': 'book_db_test',
    'host': PGHOST,
    'dialect': 'postgres',
    'imageUploadPaths': {
      'coverUploadPath': './test/testUploads/bookCovers',
      'authorProfilePicturePath': './test/testUploads/authors',
    }
  },
  'production': {
    'username': PGUSER,
    'password': PGPASSWORD,
    'database': PGDATABASE,
    'host': PGHOST,
    'dialect': 'postgres',
    'imageUploadPaths': {
      'coverUploadPath': './public/uploads/bookCovers',
      'authorProfilePicturePath': './public/uploads/authors',
    }
  },
};
