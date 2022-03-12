const { TestWatcher } = require("jest");
const supertest = require("supertest");
const {completeStrip, createUpdateQuery, createInsertQuery} = require("../controllers/general");

describe("Creates the corrrect update query for an instance", () => {
    const conditions = {book_id: "1234"}
    const dataBody = {title: "The Watchers", author: "Chris Haynes", pages: 300};
    
    describe("given proper conditions and data", () => {
        // Should give the correct query with all the conditions
        // UPDATE books SET title = $1, author = $2, pages = $3 
        // WHERE book_id = 1234
        it("Correct update query", () => {
            expect(createUpdateQuery("books", conditions, dataBody)).toStrictEqual({
                "query": "UPDATE books SET title = $1, author = $2, pages = $3 WHERE book_id = $4  RETURNING *",
                "values": ["The Watchers", "Chris Haynes", 300, "1234"],
            });
        });

        it("Multiple conditions", () => {
            const multipleCon = {book_id: "1234", author: "Chris Haynes"}
            const newBody = {title: "The Book of Basketball"}
            expect(createUpdateQuery("books", multipleCon, newBody)).toStrictEqual({
                "query": "UPDATE books SET title = $1 WHERE book_id = $2 AND author = $3  RETURNING *",
                "values": ["The Book of Basketball", "1234", "Chris Haynes"]
            });
        })
    });

    describe("given missing information", () => {
        
        it("No tablename", () => {
            expect(createUpdateQuery("", conditions, dataBody)).toStrictEqual({
                "query": "",
                "values": [],
            });
        });

        it("No conditions or data", () => {
            expect(createUpdateQuery("books", {}, {})).toStrictEqual({
                "query": "",
                "values": [],
            });
        })
    });
});

describe("Creates the correct insert query for an instance", () => {
    const data = {title: "The Hobbit", author: "J.R.R Tolkien", pages: 350};
    const tableName = "books"
    
    describe("Given proper data and conditions", () => {
        it("Correct insert query", () => {
            expect(createInsertQuery(tableName, data)).toStrictEqual({
                "query": "INSERT INTO books (title, author, pages) VALUES($1, $2, $3) RETURNING *",
                "values": ["The Hobbit", "J.R.R Tolkien", 350]
            });
        });
    });

    describe("Given missing information", () => {
        it("No tableName", () => {
            expect(createInsertQuery("", data)).toStrictEqual({
                "query": "",
                "values": []
            });
        });

        it("No data", () => {
            expect(createInsertQuery("books", {})).toStrictEqual({
                "query": "",
                "values": []
            });
        });
    });
});

