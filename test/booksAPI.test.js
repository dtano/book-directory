const request = require("supertest");
const {pool, client} = require("../models/db_setup");
const app = require("../app");
const fs = require("fs-extra");

const tableName = "books";

// Holds the name of the folders that contain uploaded test files
const uploadDirNames = ["test/testUploads/bookCovers", "test/testUploads/authors"];

// Clears the listed directories
const clearDirectories = () => {
    for(const dir of uploadDirNames){
        fs.emptyDirSync(dir);
    }
}


// Clear the books table after and before the tests are executed
beforeAll(async() => {
    // create new books table
    await pool.query(`CREATE TABLE books(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        pages INTEGER,
        date_published DATE,
        cover VARCHAR(256)
    )`);

    // Need to create author and book_author tables as well
    await pool.query(`CREATE TABLE authors(
        id SERIAL PRIMARY KEY,
        given_names VARCHAR(255),
        surname VARCHAR(255) NOT NULL,
        country VARCHAR(255),
        bio TEXT,
        profile_picture VARCHAR(256)
    )`);

    await pool.query(`CREATE TABLE book_author(
        author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        constraint id PRIMARY KEY (book_id, author_id)
    )`);

    // Clear upload folders just in case
    clearDirectories();
})
afterAll(async () => {
    // Delete table
    await pool.query(`DROP TABLE ${tableName}, authors, book_author`);

    // Clear upload folders
    clearDirectories();
});

const author_ids = []
describe("Create and get author entry", () => {
    it("Should create a new author entry", async () => {
        const response = await request(app).post("/api/author").send({
            given_names: "Haruki",
            surname: "Murakami",
            country: "Japan",
        });
        expect(response.statusCode).toBe(200);
        author_ids.push(response.body.id);
    });

    it("Should fail to create a duplicate author entry with the same name and country", async () =>{
        const response = await request(app).post("/api/author").send({
            given_names: "Haruki",
            surname: "Murakami",
            country: "Japan",
        });

        // const getAllresponse = await request(app).get("/api/author");
        // console.log("Alloi duplicate");
        // console.log(getAllresponse.body);

        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual("Duplicate author entry");
    });

    it("Should fail to create an author entry with no surname", async () => {
        const response = await request(app).post("/api/author").send({
            given_names: "Darnell",
            country: "USA",
        });

        // const getAllresponse = await request(app).get("/api/author");
        // console.log("Alloi no surname");
        // console.log(getAllresponse.body);
        expect(response.statusCode).toBe(400);
    });

    it("Should successfully get the author based on the given id", async () => {
        const response = await request(app).get(`/api/author/${author_ids[0]}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "books": [],
            "details": {
                "id": 1,
                "given_names": "Haruki",
                "surname": "Murakami",
                "country": "Japan",
                "bio": null,
                "profile_picture": null
            }
        });

    });

    it("Should fail to get an author with a non-existent id", async () => {
        const response = await request(app).get(`/api/author/100`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it("Should get all authors in the database", async () => {
        // Make a new author first
        const createResponse = await request(app).post("/api/author").send({
            given_names: "Yukio",
            surname: "Mishima",
            country: "Japan",
        });
        author_ids.push(createResponse.body.id);
        //console.log(author_ids);

        // Then call the get all route
        const response = await request(app).get("/api/author");
        // console.log("Alloi");
        // console.log(response.body);
        expect(response.body.length).toBe(author_ids.length);
    })
});

describe("Update author general information and delete author", () => {
    it("Should update the country and given name of an author", async () => {
        const response = await request(app).put(`/api/author/${author_ids[0]}`).send({
            country: "China",
            given_names: "Dwight",
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "id": 1,
            "given_names": "Dwight",
            "surname": "Murakami",
            "country": "China",
            "bio": null,
            "profile_picture": null
        });
    });

    it("Give wrong properties to update", async () => {
        const response = await request(app).put(`/api/author/${author_ids[0]}`).send({
            base: "Chicago"
        });

        expect(response.statusCode).toBe(400);
    });

    it("Delete an author entry", async () => {
        const response = await request(app).delete(`/api/author/${author_ids[0]}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "id": 1,
            "given_names": "Dwight",
            "surname": "Murakami",
            "country": "China",
            "bio": null,
            "profile_picture": null
        });

        author_ids.splice(0, 1);
    });

    it("Fail to delete an author entry that does not exist", async () => {
        const response = await request(app).delete(`/api/author/${1}`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual("There is possibly no entry with id = 1");
    });
})

let book_id = 0
// Dates are off, need to check
describe("Book post route", () => {
    it("Should create a new book entry", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Runaway Horses",
            pages: 450,
            date_published: "1989-03-22",
            author_ids: author_ids
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "date_published": "1989-03-22", 
            "id": 1, 
            "pages": 450, 
            "title": "Runaway Horses",
            "cover": null
        });
        book_id = response.body.id;
    });

    it("Prevent duplicate book from being created", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Runaway Horses",
            pages: 450,
            date_published: "1989-03-22",
            author_ids: author_ids
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual("The given entry already exists in the database");
    });

    it("Allow duplicate titles, but different author", async () => {
        const createAuthorResponse = await request(app).post("/api/author").send({
            given_names: "Brandon",
            surname: "Sanderson",
            country: "USA",
        });
        author_ids.push(createAuthorResponse.body.id);

        const response = await request(app).post("/api/book").send({
            title: "Runaway Horses",
            pages: 200,
            date_published: "1975-01-01",
            author_ids: [author_ids[1]]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "date_published": "1975-01-01",
            "id": 2,
            "pages": 200,
            "title": "Runaway Horses",
            "cover": null
        });
    });

    it("Prevent from posting a book entry with the wrong properties", async () => {
        const response = await request(app).post("/api/book").send({
            name: "Illegal entry",
            pages: 200,
            date_published: "1975-01-01",
            author_ids: [author_ids[0]]
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it("Prevent from posting a book entry when author(s) not specified", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Illegal entry",
            pages: 200,
            date_published: "1975-01-01",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual("No author specified");
    });

    it("Allow a book to be created with multiple authors", async () => {
        const response = await request(app).post("/api/book").send({
            title: "Some random book",
            pages: 500,
            date_published: "1975-01-01",
            author_ids: author_ids
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "date_published": "1975-01-01", 
            "id": 3, 
            "pages": 500, 
            "title": "Some random book",
            "cover": null
        });
    });
});

describe("Get book route", () => {
    it("Should successfully get the right entry", async () => {
        const response = await request(app).get(`/api/book/${book_id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual({
            "details": {
                "date_published": "1989-03-22", 
                "id": 1, 
                "pages": 450, 
                "title": "Runaway Horses",
                "cover": null
            },
            "authors": [{
                "given_names": "Yukio",
                "id": 3,
                "surname": "Mishima",
            }]
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
        // 3 is the number of entries that were created prior to this test
        expect(response.body.length).toBe(3);
    });
});

// Make sure user can't change their id
describe("Update book route", () => {
    it("Change the title", async () => {
        const response = await request(app).put(`/api/book/${book_id}`).send({
            bookChanges: {
                title: "New Title"
            }
        });
        expect(response.statusCode).toBe(200);
        // expect(response.body).toStrictEqual({
        //     "id": 1,
        //     "date_published": "1989-03-22",
        //     "pages": 450,
        //     "title": "New Title",
        // });

        expect(response.body).toStrictEqual("Successful update");
    });

    it("Change multiple properties (pages and date)", async () => {
        const response = await request(app).put(`/api/book/${book_id}`).send({
            bookChanges: {
                pages: 300,
                date_published: "1985-04-03"
            }
        });
        expect(response.statusCode).toBe(200);
        // expect(response.body).toStrictEqual({
        //     "id": 1,
        //     "date_published": "1985-04-03",
        //     "pages": 300,
        //     "title": "New Title",
        // });

        expect(response.body).toStrictEqual("Successful update");
    });

    // Need to make a test for updating the author
    it("Change author to another author in the database", async () => {
        // const getAllresponse = await request(app).get("/api/author");
        // console.log(getAllresponse.body);
        
        const response = await request(app).put(`/api/book/${book_id}`).send({
            authorChange: {
                authorsToRemove: [3],
                authorsToAdd: [4]
            }
        });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual("Successful update");
    })

    it("Should fail to update if book changes and author change are not specified", async () => {
        // need to check whether author is changed or not
        const response = await request(app).put(`/api/book/${book_id}`).send({
            title: "Aussie Rules",
            country: "Australia",
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it("Should fail to update if book changes body contains wrong keys", async () => {
        // need to check whether author is changed or not
        const response = await request(app).put(`/api/book/${book_id}`).send({
            bookChanges: {
                title: "Aussie Rules",
                country: "Australia",
            }
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    it("Should not process an update when body is empty", async () => {
        const response = await request(app).put(`/api/book/${book_id}`).send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toBeDefined();
    });

    // Need to upload to a separate test folder
    it("Should successfully upload a cover image to a book entry", async () => {
        const filepath = `${__dirname}/testFiles/test.jpg`;
        if(!fs.existsSync(filepath)){
            throw new Error("File does not exist");
        }
        const response = await request(app).put(`/api/book/test/cover/${book_id}`)
                                        .attach("cover", filepath)

        expect(response.statusCode).toBe(200);
        expect(response.body.cover == null).toBe(false);
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