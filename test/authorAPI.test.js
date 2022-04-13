const request = require('supertest');
const app = require('../app');
const fs = require('fs-extra');
const {Author} = require('../models/index');
const UPLOAD_DIRECTORY = 'test/testUploads/authors';

// Store the data to delete
const generatedData = [];

const DB_AUTHOR_COUNT = 4;
const DUPLICATE_AUTHOR_ERROR = 'Author with the given information already exists';

// Test values
const AUTHOR_ID_TO_FIND = 1;
const INVALID_AUTHOR_ID = 1000;
const DATE_ERROR = 'Date of death can\'t be before date of birth';

const TEST_GIVEN_NAMES = 'Dolores';
const TEST_SURNAME = 'Barton';
const TEST_COUNTRY = 'France';

let dummyAuthorId = 0;

beforeAll(async() => {
    const dummyAuthor = await createDummyAuthor();
    dummyAuthorId = dummyAuthor.dataValues.id;
    generatedData.push(dummyAuthor.dataValues);
});

afterAll(async () => {
    for(const data of generatedData){
        await Author.destroy({
            where: {
                id: data.id
            }
        });
    }
    console.log('All generated data has been destroyed');
    generatedData.length = 0;

    fs.emptyDirSync(UPLOAD_DIRECTORY);
});

describe('Get author entry', () => {
    it('Should get correct author by id', async () => {
        const response = await request(app).get(`/api/author/${AUTHOR_ID_TO_FIND}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(1);
    });

    it('Should fail to get an author with a non-existent id', async () => {
        const response = await request(app).get(`/api/author/${INVALID_AUTHOR_ID}`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it('Should get all authors in the database', async () => {
        const response = await request(app).get('/api/author');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(DB_AUTHOR_COUNT);
    });
});

describe('Create author entry', () => {
    it('Should create a new author entry, when given the correct request', async () => {
        const requestBody = {
            given_names: TEST_GIVEN_NAMES,
            surname: TEST_SURNAME,
            country_origin: TEST_COUNTRY,
            birth_date: '1900-01-01',
            death_date: '1959-03-04',
        }
        const response = await request(app).post('/api/author').send(requestBody);
        generatedData.push(response.body);
        
        expect(response.statusCode).toBe(200);
        expect(areBodyValuesEqual(requestBody, response.body)).toBe(true);
    });

    it('Should fail to create a duplicate author entry, when an author with the same name and country exists', async () => {
        const requestBody = {
            given_names: TEST_GIVEN_NAMES,
            surname: TEST_SURNAME,
            country_origin: TEST_COUNTRY,
        }

        const response = await request(app).post('/api/author').send(requestBody);
        
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual(DUPLICATE_AUTHOR_ERROR);
    });

    it('Should fail to create an author entry, when no surname is specified', async () => {
        const requestBody = {
            given_names: 'Darnell',
            country_origin: 'USA',
        }

        const response = await request(app).post('/api/author').send(requestBody);

        expect(response.statusCode).toBe(400);
    });

    it('Should fail to create an author entry, when the birth and death dates do not line up', async () => {
        const requestBody = {
            given_names: 'Darnell',
            surname: 'Smothers',
            country_origin: 'USA',
            birth_date: '1945-02-02',
            death_date: '1945-01-31',
        }

        const response = await request(app).post('/api/author').send(requestBody);
        console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toBe(DATE_ERROR);
    })
});

describe('Update author entry', () => {
    it('Should successfully update the country and given name of an author', async () => {
        const requestBody = {
            country_origin: 'Jamaica',
            given_names: 'Darren'
        }

        const response = await request(app).put(`/api/author/${dummyAuthorId}`).send(requestBody);

        expect(response.statusCode).toBe(200);
    });

    it('Should fail to update, when wrong properties are given', async () => {
        const requestBody = {
            base: 'Chicago',
        }

        const response = await request(app).put(`/api/author/${dummyAuthorId}`).send(requestBody);

        expect(response.statusCode).toBe(400);
    });

    it('Should fail to update, when the user attempts to erase their name', async () => {
        const requestBody = {
            given_names: '',
            surname: ''
        }

        const response = await request(app).put(`/api/author/${dummyAuthorId}`).send(requestBody);

        expect(response.statusCode).toBe(400);
    });
});

describe('Delete author entry', () => {
    it('Should successfully delete author entry, when the correct id is given', async () => {
        const response = await request(app).delete(`/api/author/${dummyAuthorId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual(`Successfully deleted author with id: ${dummyAuthorId}`);
    });

    it('Fail to delete an author entry that does not exist', async () => {
        const response = await request(app).delete(`/api/author/${INVALID_AUTHOR_ID}`);

        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual(`Author with id = ${INVALID_AUTHOR_ID} does not exist`);
    });
});

// Helper functions

const areBodyValuesEqual = (expectedBody, actualBody) => {
    expectedKeys = Object.keys(expectedBody);

    for(const key of expectedKeys){
        if(actualBody[key] != expectedBody[key]){
            return false;
        }
    }

    return true;
}

const createDummyAuthor = async () => {
    const dummy = await Author.create({
        given_names: 'Dorian',
        surname: 'Finney-Smith',
        country_origin: 'USA'
    });

    return dummy;
}