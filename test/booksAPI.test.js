const request = require('supertest');
const app = require('../app');
const fs = require('fs-extra');
const {Book, Author} = require('../models/index');
const UPLOAD_DIRECTORY = 'test/testUploads/bookCovers';

// Store the data to delete
const generatedData = [];

const DB_BOOKS_COUNT = 4;

// Test values
const BOOK_ID_TO_FIND = 1;
const INVALID_BOOK_ID = 1000;

const TEST_TITLE = 'Gordon\'s Way';
const TEST_PAGES = 500;
const TEST_DATE_PUBLISHED = '1989-03-22';
const TEST_AUTHOR_ID = 2;

const authorIds = [1];
let dummyBookId = 0;

const book_author_mapping = {}

// Clear the books table after and before the tests are executed
beforeAll(async () => {
  const dummyBook = await createDummyBook();
  dummyBookId = dummyBook.dataValues.id;
  generatedData.push(dummyBook.dataValues);
});

afterAll(async () => {
  for(const data of generatedData){
    // Get the book and remove their author
    await removeAuthorsFromBook(data);
    await Book.destroy({
        where: {
            id: data.id
        }, 
    });
  } 

  console.log('All generated data has been destroyed');
  generatedData.length == 0;
  
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
describe('Book post route', () => {
  it('Should create a new book entry', async () => {
    const requestBody = {
      title: TEST_TITLE,
      pages: TEST_PAGES,
      date_published: TEST_DATE_PUBLISHED,
      author_ids: [authorIds[0]],
    }
    const response = await request(app).post('/api/book').send(requestBody);
    generatedData.push(response.body);
    addMapping(response.body.id, authorIds[0]);

    expect(response.statusCode).toBe(200);
    expect(areBodyValuesEqual(requestBody, response.body)).toBeDefined();
    expect(response.body.Authors.length).toBeGreaterThan(0);
    expect(response.body.Authors[0].id).toBe(authorIds[0]);
  });

  // it('Prevent duplicate book from being created', async () => {
  //   const response = await request(app).post('/api/book').send({
  //     title: 'Runaway Horses',
  //     pages: 450,
  //     date_published: '1989-03-22',
  //     author_ids: authorIds,
  //   });
    
  //   expect(response.statusCode).toBe(400);
  //   expect(response.body).toStrictEqual('Duplicate book already exists');
  // });

  // it('Allow duplicate titles, but different author', async () => {
  //   const createAuthorResponse = await request(app).post('/api/author').send({
  //     given_names: 'Brandon',
  //     surname: 'Sanderson',
  //     country_origin: 'USA',
  //   });
  //   authorIds.push(createAuthorResponse.body.id);
  //   const response = await request(app).post('/api/book').send({
  //     title: 'Runaway Horses',
  //     pages: 200,
  //     date_published: '1975-01-01',
  //     author_ids: [authorIds[1]],
  //   });
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body).toBeDefined();
  //   expect(response.body.Authors[0]).toStrictEqual({
  //     'id': 3,
  //     'given_names': 'Brandon',
  //     'surname': 'Sanderson',
  //     'profile_picture': null,
  //     'country_origin': 'USA',
  //     'bio': null,
  //     'book_author': {
  //       'author_id': 2,
  //       'book_id': 3,
  //       'createdAt': expect.any(String),
  //       'updatedAt': expect.any(String),
  //     }
  //   });
  // });

  // it('Prevent from posting a book entry with the wrong properties', async () => {
  //   const response = await request(app).post('/api/book').send({
  //     name: 'Illegal entry',
  //     pages: 200,
  //     date_published: '1975-01-01',
  //     author_ids: [authorIds[0]],
  //   });
  //   expect(response.statusCode).toBe(400);
  //   expect(response.body).toBeDefined();
  // });

  // it('Prevent from posting a book entry when author(s) not specified', async () => {
  //   const response = await request(app).post('/api/book').send({
  //     title: 'Illegal entry',
  //     pages: 200,
  //     date_published: '1975-01-01',
  //   });
  //   expect(response.statusCode).toBe(400);
  //   expect(response.body).toStrictEqual('No author(s) specified');
  // });

  // it('Allow a book to be created with multiple authors', async () => {
  //   console.log(authorIds);
  //   const response = await request(app).post('/api/book').send({
  //     title: 'Some random book',
  //     pages: 500,
  //     date_published: '1975-01-01',
  //     author_ids: authorIds,
  //   });
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.Authors.length).toBe(authorIds.length);
  // });
});



// // Make sure user can't change their id
// describe('Update book route', () => {
//   it('Change the title', async () => {
//     const response = await request(app).put(`/api/book/${bookId}`).send({
//       bookChanges: {
//         title: 'New Title',
//       },
//     });
//     expect(response.statusCode).toBe(200);
//     // expect(response.body).toStrictEqual({
//     //     "id": 1,
//     //     "date_published": "1989-03-22",
//     //     "pages": 450,
//     //     "title": "New Title",
//     // });

//     expect(response.body.title).toBe('New Title');
//   });

//   it('Change multiple properties (pages and date)', async () => {
//     const response = await request(app).put(`/api/book/${bookId}`).send({
//       bookChanges: {
//         pages: 300,
//         date_published: '1985-04-03',
//       },
//     });
    
//     expect(response.statusCode).toBe(200);
//     expect(response.body.pages).toBe(300);
//     expect(response.body.date_published).toBe('1985-04-03');
//   });

//   // Need to make a test for updating the author
//   it('Change author to another author in the database', async () => {
//     const response = await request(app).put(`/api/book/${bookId}`).send({
//       authorChange: {
//         authorsToRemove: [2],
//         authorsToAdd: [3],
//       },
//     });

//     expect(response.statusCode).toBe(200);
//     expect(response.body.Authors.length).toBe(1);
//     expect(response.body.Authors[0].id).toBe(3);
//   });

//   it('Should fail to update if book changes and author change are not specified', async () => {
//     // need to check whether author is changed or not
//     const response = await request(app).put(`/api/book/${bookId}`).send({
//       title: 'Aussie Rules',
//       country: 'Australia',
//     });

//     expect(response.statusCode).toBe(400);
//     expect(response.body).toBeDefined();
//   });

//   it('Should fail to update if book changes body contains wrong keys', async () => {
//     // need to check whether author is changed or not
//     const response = await request(app).put(`/api/book/${bookId}`).send({
//       bookChanges: {
//         title: 'Aussie Rules',
//         country: 'Australia',
//       },
//     });
//     expect(response.statusCode).toBe(400);
//     expect(response.body).toBeDefined();
//   });

//   it('Should not process an update when body is empty', async () => {
//     const response = await request(app).put(`/api/book/${bookId}`).send({});
//     expect(response.statusCode).toBe(400);
//     expect(response.body).toBeDefined();
//   });

//   // Need to upload to a separate test folder
//   it('Should successfully upload a cover image to a book entry', async () => {
//     const filepath = `${__dirname}/testFiles/test.jpg`;
//     if (!fs.existsSync(filepath)) {
//       throw new Error('File does not exist');
//     }
//     const response = await request(app).put(`/api/book/test/cover/${bookId}`)
//         .attach('cover', filepath);

//     expect(response.statusCode).toBe(200);
//     expect(response.body.cover == null).toBe(false);
//   });
// });

// describe('Delete book route', () => {
//   it('Successfully delete multiple entries', async () => {
//     const response = await request(app).delete(`/api/book/multiple`).send({
//       deleteIDs: [1, 2],
//     });
//     expect(response.statusCode).toBe(200);
//     expect(response.body.length).toBe(2);
//   });

//   it('Fails to delete an entry with a non-existent ID', async () => {
//     const response = await request(app).delete(`/api/book/multiple`).send({
//       deleteIDs: [1000],
//     });
//     expect(response.statusCode).toBe(404);
//     expect(response.body).toBeDefined();
//     expect(response.body.failedIds.length).toBe(1);
//   });

//   it('Does not proceed with deleting when body is empty', async () => {
//     const response = await request(app).delete(`/api/book/multiple`).send({});
//     expect(response.statusCode).toBe(400);
//     expect(response.body).toBeDefined();
//   });
// });

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

const createDummyBook = async () => {
  const dummy = await Book.create({
      title: 'The Copycat',
      pages: 150,
      date_published: '2000-01-01',
      author_ids: [TEST_AUTHOR_ID],
  });

  addMapping(dummy.dataValues.id, TEST_AUTHOR_ID);

  return dummy;
}

const removeAuthorsFromBook = async (book) => {
  const bookObj = await Book.findOne({
    where: {id: book.id},
    include: Author,
  })

  for(const author of bookObj.dataValues.Authors){
    await bookObj.removeAuthor(author);
  }
};

const addMapping = (bookId, authorId) => {
  if(bookId in book_author_mapping){
    book_author_mapping[bookId].append(authorId);
  }else{
    book_author_mapping[bookId] = [authorId];
  }
}
