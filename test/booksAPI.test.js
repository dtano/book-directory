const request = require("supertest");
const {pool, client} = require("../Models/db_setup");
const app = require("../app");

const tableName = "books";

// Clear the books table after and before the tests are executed
beforeAll(async() => {
    await pool.query(`TRUNCATE TABLE ${tableName}`)
})
afterAll(async () => {
    await pool.query(`TRUNCATE TABLE ${tableName}`);
});

describe("Book post route", () => {
    it("Should create a new book entry", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Norwegian Wood",
            author: "Haruki Murakami",
            pages: "450",
            date_published: "22/03/1989"
        });
        expect(response.statusCode).toBe(200);
    });
});