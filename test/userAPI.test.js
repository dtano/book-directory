const request = require('supertest');
const app = require('../app');

describe('User Registration', () => {
    it('Should register new user, when the request body is valid', async () => {
        const requestBody = {
            username: "danger567",
            password: "Hortolega180",
            given_names: "Darnell",
            surname: "Curry",
            email: "darnell@email.com"
        };

        const response = await request(app).post(`api/user/register`).send(requestBody);

        expect(response.statusCode).toBe(200);
    });
})