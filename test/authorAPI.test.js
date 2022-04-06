const request = require('supertest');
const app = require('../app');
const fs = require('fs-extra');
const db = require('../models/index');
const uploadDirectory = 'test/testUploads/authors';

// Store the data to delete
const generatedData = [];

const authorIdToFind = 1;
const invalidAuthorId = 1000;
const dbAuthorCount = 3;

afterAll(async () => {
    for(const data of generatedData){
        await data.destroy({truncate: true});
    }
    console.log('All generated data has been destroyed');
});

describe('Get author entries', () => {
    test('Should get correct author by id', async () => {
        const response = await request(app).get(`/api/author/${authorIdToFind}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(1);
    });

    test('Should fail to get an author with a non-existent id', async () => {
        const response = await request(app).get(`/api/author/${invalidAuthorId}`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    test('Should get all authors in the database', async () => {
        const response = await request(app).get('/api/author');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(dbAuthorCount);
    });
});

// describe('Create author entry', () => {
//     test('Should create a new author entry', async () => {
//         const response = await request(app).post('/api/author').send({
//             given_names: 'Dolores',
//             surname: 'Barton',
//             country_origin: 'France',
//         });

//         expect(response.statusCode).toBe(200);
//         generatedData.push(response.body);

//     });
// });