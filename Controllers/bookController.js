const express = require("express");
const {pool, client} = require("../Models/db_setup");
const {checkDupEntry, createUpdateQuery, createInsertQuery, getAllEntries} = require("./general");

// Creates a new book entry in the database
const postBook = async (req, res) => {
    try{
        /*
            TODO
            - Need to check title and make sure its formatted right
            - Check author name format as well
            - Fix date published bug (Keeps showing up as null, probably cuz it came as a string)
        */
        if (await checkDupEntry(req.body, "books")){
            throw new Error("Duplicate book entry");
        }

        // author has to be an id. If its a new author, then the user is prompted to make a new author entry
        //const {title, author, pages=0, date_published} = req.body;
        const {query, values} = createInsertQuery("books", req.body);

        const newBook = await pool.query(query, values);

        res.status(200).json(newBook);
    }catch(err){
        res.status(400).json(err.message);
    }
}

// Update book entry with the values in the request body
const updateBook = async (req, res) => {
    const { id } = req.params;
    try{
        const { query, values } = createUpdateQuery("books", {book_id: id}, req.body);
        updatedEntry = await pool.query(query, values);
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
        // Map the ids into its '$' numbers for the database query
        const delTupes = deleteIDs.map((id, index) => `$${index + 1}`);
        const objsToDelete = delTupes.join(", ");

        let delQuery = `DELETE FROM books WHERE book_id IN (${objsToDelete}) RETURNING *`
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
        var book = await pool.query("SELECT * FROM books WHERE book_id = ($1)", [id]);
        if(book.rows.length == 0){
            throw new Error(`Book with id = ${id} not found`);
        }
        res.status(200).json(book.rows[0]);
    }catch(err){
        //console.error(err.message);
        res.status(400).json(err.message);
    }
}

const deleteBook = async (req, res) => {
    const { id } = req.params;
    try{
        var deletedEntry = await pool.query("DELETE FROM books WHERE book_id = ($1) RETURNING *", [id]);
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

module.exports = {
    postBook,
    updateBook,
    deleteBook,
    deleteMultipleBooks,
    getBook,
    getAllBooks
}