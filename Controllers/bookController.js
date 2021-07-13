const express = require("express");
const {pool, client} = require("../Models/db_setup");
const {checkDupEntry, createUpdateQuery, createInsertQuery, getAllEntries} = require("./general");
const path = require("path");

// Where images will be stored in the project directory
const coverUploadPath = path.join("public", "uploads/bookCovers");

// Creates a new book entry in the database
const postBook = async (req, res) => {
    try{
        /*
            DIFFERENT APPROACH
        */
        // Check if author is specified
        if(!req.body.hasOwnProperty("author_id")){
            throw new Error("No author specified");
        }
        
        // Let's just assume a book has only one author
        if(!checkAuthorPresence(req.body.author_id)){
            throw new Error("Author is either unspecified or they are unlisted");
        }
        
        const queryBody = {
            title: req.body.title,
            pages: req.body.pages,
            date_published: req.body.date_published
        };
        
        // Create an Insert query using the query body
        const {query, values} = createInsertQuery("books", queryBody);

        // Make the new book entry
        const newBook = await pool.query(query, values);

        // Then link the book to the author by creating an entry in the book_author table
        const bookAuthorLink = await linkBookToAuthor(newBook.rows[0].id, req.body.author_id);

        if(bookAuthorLink == null){
            throw new Error("Failed to establish a link between book and author");
        }

        res.status(200).json(newBook);

    }catch(err){
        res.status(400).json(err.message);
    }
}

// Creates an entry that links the book to the author
const linkBookToAuthor = async (book_id, author_id) => {
    // Create an entry in the book_author table
    const {query, values} = createInsertQuery("book_author", {author_id: author_id, book_id: book_id});
    const link = await pool.query(query, values);

    return link;
}

// Accepts request body and does an author check
const checkAuthorPresence = async (author_id) => {
    // Check if the author id exists 
    const authorPresenceQuery = "SELECT * FROM authors WHERE id = $1";
    const selectedAuthor = await pool.query(authorPresenceQuery, [author_id]);

    if(selectedAuthor == null || selectedAuthor.rows.length == 0){
        return false;
    }

    return true;

}

// Returns a list of authors who wrote the book
const getBookAuthor = async (book) => {
    let query = "SELECT a.id, a.given_names, a.surname FROM book_author ba JOIN authors a ON (ba.author_id = a.id) WHERE ba.book_id = $1;"
    const writers = await pool.query(query, [book.id]);

    return writers.rows;
}

// Update book entry with the values in the request body
const updateBook = async (req, res) => {
    const { id } = req.params;
    try{
        if(Object.keys(req.body).length === 0){
            throw new Error("The body is empty");
        }
        
        // book_author entry needs to be updated as well if author is changed
        const { query, values } = createUpdateQuery("books", {id: id}, req.body);
        updatedEntry = await pool.query(query, values);

        // Means that we're going to have to update the author as well
        if(checkAuthorPresence(req.body)){
            // But we need to check whether the given author id is the same as the original or not
            const authors = await getBookAuthor(updatedEntry.rows[0]);
            
            // If there are multiple authors, we're going to have to find the one entry that has 
        }

        if(req.body.hasOwnProperty("old_author_id") && req.body.hasOwnProperty("new_author_id")){
            if(req.body.old_author_id != req.body.new_author_id){
                const bothPresent = await checkAuthorPresence(req.body.old_author_id) && await checkAuthorPresence(req.body.new_author_id);
                // Then we can change the author
                if(bothPresent){
                    const { query, values } = createUpdateQuery("books", {author_id: req.body.old_author_id}, {author_id: req.body.new_author_id});
                    await pool.query(query, values);
                }
            }
        }


        res.status(200).json(updatedEntry.rows[0]);
    }catch(err){
        res.status(400).json(err.message);
    }
}

// Delete specified book entries from the database
const deleteMultipleBooks = async (req, res) => {
    try{
        // req.body should hold a list of ids to delete
        const { deleteIDs } = req.body;
        if(!deleteIDs || deleteIDs.length === 0){
            throw new Error("No ids to delete");
        }
        // Map the ids into its '$' numbers for the database query
        const delTupes = deleteIDs.map((id, index) => `$${index + 1}`);
        const objsToDelete = delTupes.join(", ");

        let delQuery = `DELETE FROM books WHERE id IN (${objsToDelete}) RETURNING *`
        const removed = await pool.query(delQuery, deleteIDs);
        
        // This means that the given ids don't exist
        if(removed.rows.length == 0){
            throw new Error(`The given ids were not deleted ${ deleteIDs }`);
        }else if(removed.rows.length != deleteIDs.length){
            // Find out which entry was not deleted
            const success = removed.rows.map((entry) => entry.book_id);
            const failed = deleteIDs.filter((id) => !success.includes(id));
            res.status(404).json({
                entriesDeleted: success,
                failedDeletes: failed
            });
        }else{
            res.status(200).json(removed.rows);
        }
    }catch(err){
        res.status(400).json(err.message);
    }
}

const getBook = async (req, res) => {
    const { id } = req.params;
    try{
        var book = await pool.query("SELECT * FROM books WHERE id = ($1)", [id]);
        if(book.rows.length == 0){
            throw new Error(`Book with id = ${id} not found`);
        }

        // Find the author
        const authors = await getBookAuthor(book.rows[0]);
        
        res.status(200).json(book.rows[0]);
    }catch(err){
        //console.error(err.message);
        res.status(400).json(err.message);
    }
}

const deleteBook = async (req, res) => {
    const { id } = req.params;
    try{
        var deletedEntry = await pool.query("DELETE FROM books WHERE id = ($1) RETURNING *", [id]);
        if (deletedEntry.rows.length == 0){
            throw new Error(`There is possibly no entry with id = ${id}`);
        }
        res.status(200).json(deletedEntry.rows[0]);
    }catch(err){
        res.status(400).json(err.message);
    }
}

// Returns all of the book entries
// On error, it simply returns a blank array
const getAllBooks = async (req, res) => {
    try{
        const allBooks = await getAllEntries("books");
        res.status(200).json(allBooks);
    }catch(err){
        res.status(400).json(err.message);
    }
}

const uploadCoverImage = async (fileName) => {
    if(fileName === null){
        throw new Error("No file given");
    }
}

module.exports = {
    postBook,
    updateBook,
    deleteBook,
    deleteMultipleBooks,
    getBook,
    getAllBooks
}