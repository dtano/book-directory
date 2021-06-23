const request = require("supertest");
const {pool, client} = require("../Models/db_setup");
const app = require("../app");

const tableName = "books";

// Clear the books table after and before the tests are executed
beforeAll(async() => {
    // create new books table
    await pool.query(`CREATE TABLE ${tableName}(
        book_id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        pages INTEGER,
        date_published DATE
    )`)
})
afterAll(async () => {
    // Delete table
    await pool.query(`DROP TABLE ${tableName}`)
});

// This book_id will be used to test the update and delete queries
let book_id;

describe("Book post route", () => {
    it("Should create a new book entry", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Norwegian Wood",
            author: "Haruki Murakami",
            pages: 450,
            date_published: "22/03/1989"
        });
        expect(response.statusCode).toBe(200);
        book_id = response.body.rows[0].book_id;
    });

    it("Prevent duplicate book from being created", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Norwegian Wood",
            author: "Haruki Murakami",
            pages: 450,
            date_published: "22/03/1989"
        });
        expect(response.statusCode).toBe(400);
    });

    it("Allow duplicate titles, but different author", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Norwegian Wood",
            author: "John Lennon",
            pages: 200,
            date_published: "01/01/1975"
        });
        expect(response.statusCode).toBe(200);
    });

    it("Prevent from posting a book entry with the wrong properties", async () => {
        const response = await request(app).post("/api/book").send({
            name: "Illegal entry",
            writer: "Anonymous",
            pages: 200,
            date_published: "01/01/1975"
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });
});

describe("Get book route", () => {
    it("Should successfully get the right entry", async () => {
        const response = await request(app).get(`/api/book/${book_id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "author": "Haruki Murakami",
            "book_id": 1,
            "date_published": "1989-03-21T17:00:00.000Z",
            "pages": 450,
            "title": "Norwegian Wood",
        });
    });

    it("Should fail to get a book with a non-existent id", async () => {
        const response = await request(app).get(`/api/book/100`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it("Should get all book entries", async () => {
        const response = await request(app).get(`/api/book`);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    })
});