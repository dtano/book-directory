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
// Dates are off, need to check
describe("Book post route", () => {
    it("Should create a new book entry", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Norwegian Wood",
            author: "Haruki Murakami",
            pages: 450,
            date_published: "1989-03-22"
        });
        expect(response.statusCode).toBe(200);
    });

    it("Prevent duplicate book from being created", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Norwegian Wood",
            author: "Haruki Murakami",
            pages: 450,
            date_published: "1989-03-22"
        });
        expect(response.statusCode).toBe(400);
    });

    it("Allow duplicate titles, but different author", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Norwegian Wood",
            author: "John Lennon",
            pages: 200,
            date_published: "1975-01-01"
        });
        expect(response.statusCode).toBe(200);
        book_id = response.body.rows[0].book_id;
    });

    it("Prevent from posting a book entry with the wrong properties", async () => {
        const response = await request(app).post("/api/book").send({
            name: "Illegal entry",
            writer: "Anonymous",
            pages: 200,
            date_published: "1975-01-01"
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
            "author": "John Lennon",
            "book_id": 2,
            "date_published": "1975-01-01",
            "pages": 200,
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
        // 2 is the number of entries that were created prior to this test
        expect(response.body.length).toBe(2);
    });
});

// Make sure user can't change their id
describe("Update book route", () => {
    it("Change the title", async () => {
        const response = await request(app).put(`/api/book/${book_id}`).send({
            title: "New Title"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "author": "John Lennon",
            "book_id": 2,
            "date_published": "1975-01-01",
            "pages": 200,
            "title": "New Title",
        });
    });

    it("Change multiple properties (author, pages and date)", async () => {
        const response = await request(app).put(`/api/book/${book_id}`).send({
            author: "Stephen Queen",
            pages: 300,
            date_published: "1985-04-03"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "author": "Stephen Queen",
            "book_id": 2,
            "date_published": "1985-04-03",
            "pages": 300,
            "title": "New Title",
        });
    });

    it("Should fail to update if at least one of the properties is wrong", async () => {
        // need to check whether author is changed or not
        const response = await request(app).put(`/api/book/${book_id}`).send({
            author: "Jimmy Cox",
            country: "Australia",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it("Should not process an update when body is empty", async () => {
        const response = await request(app).put(`/api/book/${book_id}`).send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });
});

describe("Delete book route", () => {
    it("Successfully delete multiple entries", async () => {
        const response = await request(app).delete(`/api/book/multiple`).send({
            deleteIDs: [1, 2]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it("Fails to delete an entry with a non-existent ID", async () => {
        const response = await request(app).delete(`/api/book/multiple`).send({
            deleteIDs: [1]
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it("Does not proceed with deleting when body is empty", async () => {
        const response = await request(app).delete(`/api/book/multiple`).send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });
});