const express = require("express");
const {pool, client} = require("../Models/db_setup");
const {checkDupEntry, createUpdateQuery, createInsertQuery, getAllEntries, getBookAuthor, checkAuthorPresence} = require("./general");
const path = require("path");
const format = require("pg-format");

// Where images will be stored in the project directory
const coverUploadPath = path.join("public", "uploads/bookCovers");

// Creates a new book entry in the database
const postBook = async (req, res) => {
    try{
        /*
            DIFFERENT APPROACH
        */
        // Check if author is specified
        if(!req.body.hasOwnProperty("author_ids")){
            throw new Error("No author specified");
        }

        // This assumes that author_id is an array of IDs
        if(!(await checkAuthorPresence(req.body.author_ids))){
            throw new Error("At least one of the specified authors does not exist in the database");
        }

        // // Need to look for duplicates
        if(await checkDupEntry(req.body, "books")){
            throw new Error("The given entry already exists in the database");
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
        // const bookAuthorLink = await linkBookToAuthor(newBook.rows[0].id, req.body.author_id);
        const bookAuthorLinks = await linkBookToAuthors(newBook.rows[0].id, req.body.author_ids);

        if(bookAuthorLinks == null || bookAuthorLinks.rows.length != req.body.author_ids.length){
            throw new Error("Failed to establish a link between book and author(s)");
        }

        res.status(200).json(newBook.rows[0]);

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

// Use this to link multiple authors to a book
const linkBookToAuthors = async (book_id, author_ids) => {
    // Now we need to make nested array that contains book_id and author_ids
    if(author_ids.length == 0){
        throw new Error("No authors specified");
    }
    
    let values = [];

    author_ids.forEach((author_id) => {
        values.push([author_id, book_id]);
    });

    const query = format('INSERT INTO book_author(author_id, book_id) VALUES %L RETURNING *', values);
    const links = await pool.query(query);

    return links;
}

// Update book entry with the values in the request body
const updateBook = async (req, res) => {
    const { id } = req.params;
    try{
        if(req.body === null || Object.keys(req.body).length === 0){
            throw new Error("The body is empty");
        }
        
        // Needs fixing
        // book_author entry needs to be updated as well if author is changed
        // const { query, values } = createUpdateQuery("books", {id: id}, req.body);
        // const updatedEntry = await pool.query(query, values);

        // Update the general details of the book
        let updatedEntry = null;
        let successfulUpdate = false;
        
        if(req.body.bookChanges != null){
            updatedEntry = await changeBookDetails(req.body.bookChanges, id);
            successfulUpdate = true;
        }

        if(req.body.authorChange != null){
            // Update the author if the body specified it
            await changeAuthor(req.body.authorChange, id);
            //console.log("Author changed");
            successfulUpdate = true;
        }

        if(successfulUpdate){
            // Can't return this if its just the author that is changed
            res.status(200).json("Successful update");
        }else{
            res.status(400).json("The request body contains the wrong keys");
        }
    }catch(err){
        res.status(400).json(err.message);
    }
}

const changeBookDetails = async (updateBody, bookID) => {
    if(Object.keys(updateBody).length === 0){
        throw new Error("No details to change are specified");
    }

    const { query, values } = createUpdateQuery("books", {id: bookID}, updateBody);
    const updatedEntry = await pool.query(query, values);

    return updatedEntry.rows
}

const changeAuthor = async (body, bookID) => {
    if(body != null && Object.keys(body).length > 0 && body.hasOwnProperty("oldAuthorID") && body.hasOwnProperty("newAuthorID")){
        const authors = await getBookAuthor(bookID);

        // Check whether the new author id is a valid one
        if (!(await checkAuthorPresence([body.newAuthorID]))){
            throw new Error("Entry updated, but author can't because the new author id given is not valid");
        }
        
        let successfulChange = false; 
        if(authors.length > 0){
            for(const author of authors){
                if(author.id === body.oldAuthorID){
                    //console.log("Found author id to change");

                    // Problem here!!!
                    const {query, values} = createUpdateQuery("book_author", {book_id: bookID, author_id: body.oldAuthorID}, {author_id: body.newAuthorID});
                    
                    const authorChange = await pool.query(query, values);
                    //console.log("Book's author changed");
                    successfulChange = true;
                    break;
                }
            }
        }

        if(!successfulChange){
            throw new Error("Author was not changed because the specified author to change is invalid");
        }
    }else{
        throw new Error("No author IDs given for updating");
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
        const authors = await getBookAuthor(book.rows[0].id);
        
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