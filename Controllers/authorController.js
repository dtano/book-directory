const express = require("express");
const {pool, client} = require("../Models/db_setup");
const {checkDupEntry, createUpdateQuery, createInsertQuery, getAllEntries} = require("./general");
const path = require("path");
// Where images will be stored in the project directory
const authorUploadPath = path.join("public", "uploads/authors");

// Create a new author entry
const postAuthor = async (req, res) => {
    try{
        // Need to validate the given data
        // name and country of origin
        if (await checkDupEntry(req.body, "authors")){
            throw new Error("Duplicate author entry");
        }
        
        const {query, values} = createInsertQuery("authors", req.body);
        
        const newAuthor = await pool.query(query, values);
        res.status(200).json(newAuthor);

    }catch(err){
        res.status(400).json(err.message);
    }
}

// Returns all author entries to client
const getAllAuthors = async (req, res) => {
    try{
        const allAuthors = await getAllEntries("authors");
        res.status(200).json(allAuthors);
    }catch(err){
        res.status(400).json(err.message);
    }
}

// Gets specified author
const getAuthor = async (req, res) => {
    const { id } = req.params;
    try{
        var author = await pool.query("SELECT * FROM authors WHERE author_id = ($1)", [id]);
        if(author.rows.length == 0){
            throw new Error(`Book with id = ${id} not found`);
        }
        res.status(200).json(author.rows[0]);
    }catch(err){
        console.error(err.message);
        res.status(400).json(err.message);
    }
}

// Updates author entry with given data
const updateAuthor = async (req, res) => {
    const { id } = req.params;
    try{
        // Must make sure that req body is proper
        const { query, values } = createUpdateQuery("authors", {author_id: id}, req.body);
        updatedEntry = await pool.query(query, values);
        res.status(200).json(updatedEntry.rows[0]);
    }catch(err){
        res.status(400).json(err.message);
    }
}

// Deletes author with given id if it exists
const deleteAuthor = async (req, res) => {
    const { id } = req.params;
    try{
        var deletedEntry = await pool.query("DELETE FROM authors WHERE author_id = ($1) RETURNING *", [id]);
        if (deletedEntry.rows.length == 0){
            throw new Error(`There is possibly no entry with id = ${id}`);
        }
        res.status(200).json(deletedEntry.rows[0]);
    }catch(err){
        res.status(400).json(err.message);
    }
}

module.exports = {
    postAuthor,
    getAllAuthors,
    getAuthor,
    deleteAuthor,
    updateAuthor
}