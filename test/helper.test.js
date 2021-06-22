const { TestWatcher } = require("jest");
const supertest = require("supertest");
const {completeStrip, createUpdateQuery} = require("../Controllers/general");

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

