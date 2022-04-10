const request = require('supertest');
const app = require('../app');
const fs = require('fs-extra');
const {Book, Author} = require('../models/index');
const UPLOAD_DIRECTORY = 'test/testUploads/bookCovers';

// Store the data to delete
const generatedData = [];

const DB_BOOKS_COUNT = 3;

// Test values
const BOOK_ID_TO_FIND = 1;
const INVALID_BOOK_ID = 1000;
const REPLACEMENT_AUTHOR_ID = 3;

const TEST_TITLE = 'Gordon\'s Way';
const TEST_PAGES = 500;
const TEST_DATE_PUBLISHED = '1989-03-22';

const authorIds = [1, 2];
let bookToUpdateId = 0;
const book_author_mapping = {}

afterAll(async () => {
  fs.emptyDirSync(UPLOAD_DIRECTORY);
});

describe('Get book entry', () => {
  it('Should get correct book by id', async () => {
    const response = await request(app).get(`/api/book/${BOOK_ID_TO_FIND}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(BOOK_ID_TO_FIND);
    expect(response.body.Authors).toBeDefined();
    expect(response.body.Authors.length).toBeGreaterThan(0);
  });

  it('Should fail to get a book with a non-existent id', async () => {
    const response = await request(app).get(`/api/book/${INVALID_BOOK_ID}`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
  });

  it('Should get all book entries', async () => {
    const response = await request(app).get(`/api/book`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(DB_BOOKS_COUNT);
  });
});

// // Dates are off, need to check
describe('Post book entry', () => {
  it('Should create a new book entry', async () => {
    const requestBody = {
      title: TEST_TITLE,
      pages: TEST_PAGES,
      date_published: TEST_DATE_PUBLISHED,
      author_ids: [authorIds[0]],
    }

    const response = await request(app).post('/api/book').send(requestBody);
    generatedData.push(response.body);
    bookToUpdateId = response.body.id;
    addMapping(response.body.id, requestBody.author_ids);


    expect(response.statusCode).toBe(200);
    expect(areBodyValuesEqual(requestBody, response.body)).toBe(true);
    expect(response.body.Authors.length).toBeGreaterThan(0);
    expect(response.body.Authors[0].id).toBe(authorIds[0]);
  });

  it('Should prevent duplicate book from being created, when details are exactly the same', async () => {
    const response = await request(app).post('/api/book').send({
      title: TEST_TITLE,
      pages: TEST_PAGES,
      date_published: TEST_DATE_PUBLISHED,
      author_ids: [authorIds[0]],
    });
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual('Duplicate book already exists');
  });

  // it('Allow duplicate titles, but different author', async () => {
  //   const requestBody = {
  //     title: TEST_TITLE,
  //     pages: TEST_PAGES,
  //     date_published: TEST_DATE_PUBLISHED,
  //     author_ids: [authorIds[1]],
  //   }
    
  //   console.log(requestBody);
  //   const response = await request(app).post('/api/book').send(requestBody);
  //   console.log(response.body);
  //   generatedData.push(response.body);
    
  //   expect(response.statusCode).toBe(200);
  //   expect(areBodyValuesEqual(requestBody, response.body)).toBe(true);
  //   expect(response.body.Authors.length).toBeGreaterThan(0);
  //   expect(response.body.Authors[0].id).toBe(authorIds[1]);
  // });

  it('Should prevent from posting a book entry, when request body has wrong properties', async () => {
    const requestBody = {
      name: 'Illegal entry',
      pages: 200,
      date_published: '1975-01-01',
      author_ids: [authorIds[0]],
    }
    
    const response = await request(app).post('/api/book').send(requestBody);
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
  });

  it('Should prevent from posting a book entry, when author(s) not specified', async () => {
    const requestBody = {
      title: 'Illegal entry',
      pages: 200,
      date_published: '1975-01-01',
    }
    
    const response = await request(app).post('/api/book').send(requestBody);
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual('No author(s) specified');
  });

  it('Should allow a book to be created with multiple authors', async () => {
    const requestBody = {
      title: 'Some random book',
      pages: 500,
      date_published: '1975-01-01',
      author_ids: authorIds,
    }
    
    const response = await request(app).post('/api/book').send(requestBody);
    generatedData.push(response.body);
    addMapping(response.body.id, requestBody.author_ids);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.Authors.length).toBe(authorIds.length);
  });
});



// Make sure user can't change their id
describe('Update book entry', () => {
  it('Should change the book\'s title, when it is specified in the request body', async () => {
    const bookObj = await Book.findOne({where: {id: bookToUpdateId}, include: Author});
    console.log(bookObj.dataValues);
    
    const requestBody = {
      bookChanges: {
        title: 'New Title',
      }
    };
    const response = await request(app).put(`/api/book/${bookToUpdateId}`).send(requestBody);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(requestBody.bookChanges.title);
  });

  it('Should change multiple properties (pages and date)', async () => {
    const requestBody = {
      bookChanges: {
        pages: 300,
        date_published: '1985-04-03',
      }
    }

    const response = await request(app).put(`/api/book/${bookToUpdateId}`).send(requestBody);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.pages).toBe(requestBody.bookChanges.pages);
    expect(response.body.date_published).toBe(requestBody.bookChanges.date_published);
  });

  // // Need to make a test for updating the author
  it('Should change author to another author in the database', async () => {
    const requestBody = {
      authorChange: {
        authorsToRemove: book_author_mapping[bookToUpdateId],
        authorsToAdd: [REPLACEMENT_AUTHOR_ID],
      }
    }
    
    const response = await request(app).put(`/api/book/${bookToUpdateId}`).send(requestBody);

    expect(response.statusCode).toBe(200);
    expect(response.body.Authors.length).toBe(1);
    expect(response.body.Authors[0].id).toBe(REPLACEMENT_AUTHOR_ID);
  });

  it('Should fail to update, when book changes and author change are not specified', async () => {
    // need to check whether author is changed or not
    const requestBody = {
      title: 'Aussie Rules',
      country: 'Australia',
    }
    
    const response = await request(app).put(`/api/book/${bookToUpdateId}`).send(requestBody);

    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
  });

  it('Should fail to update if book changes body contains wrong keys', async () => {
    const requestBody = {
      bookChanges: {
        title: 'Aussie Rules',
        country: 'Australia',
      },
    }
    // need to check whether author is changed or not
    const response = await request(app).put(`/api/book/${bookToUpdateId}`).send(requestBody);
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
  });

  it('Should not process an update when body is empty', async () => {
    const response = await request(app).put(`/api/book/${bookToUpdateId}`).send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
  });

  // // Need to upload to a separate test folder
  // it('Should successfully upload a cover image to a book entry', async () => {
  //   const filepath = `${__dirname}/testFiles/test.jpg`;
  //   if (!fs.existsSync(filepath)) {
  //     throw new Error('File does not exist');
  //   }
  //   const response = await request(app).put(`/api/book/test/cover/${bookId}`)
  //       .attach('cover', filepath);

  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.cover == null).toBe(false);
  // });
});

describe('Delete book route', () => {
  it('Successfully delete multiple entries', async () => {
    const booksToDeleteIds = generatedData.map(bookData => bookData.id);
    
    const response = await request(app).delete(`/api/book/multiple`).send({
      deleteIDs: booksToDeleteIds,
    });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(booksToDeleteIds.length);
  });

  it('Fails to delete an entry with a non-existent ID', async () => {
    const response = await request(app).delete(`/api/book/multiple`).send({
      deleteIDs: [INVALID_BOOK_ID],
    });
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toBeDefined();
    expect(response.body.failedIds.length).toBe(1);
  });

  it('Does not proceed with deleting when body is empty', async () => {
    const response = await request(app).delete(`/api/book/multiple`).send({});
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toBeDefined();
  });
});

// Helper functions

const areBodyValuesEqual = (expectedBody, actualBody) => {
  expectedKeys = Object.keys(expectedBody);

  for(const key of expectedKeys){
      if(key != 'author_ids' && actualBody[key] != expectedBody[key]){
          return false;
      }
  }

  return true;
}

const removeAuthorsFromBook = async (book) => {
  const bookObj = await Book.findOne({
    where: {id: book.id},
    include: Author,
  })

  if(bookObj != null){
    for(const author of bookObj.dataValues.Authors){
      await bookObj.removeAuthor(author);
    }
  }
};

const deleteBook = async (book) => {
  await removeAuthorsFromBook(book);
  await Book.destroy({
      where: {
          id: book.id
      }, 
  });
}

const addMapping = (bookId, authorIds) => {
  book_author_mapping[bookId] = authorIds;
}
