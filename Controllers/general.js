const express = require("express");
const {pool, client} = require("../Models/db_setup");
const format = require("pg-format");


// A extensive strip of a string
const completeStrip = (str) => {
    // Trim trailing, leading and separating whitespaces, replace punctuation with blanks and turn the string into lowercase 
    return str.trim().replace(/\s/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
}

// Specific logic on finding duplicate book
const checkDupBook = async (book, duplicates) => {
    if(duplicates.rows.length > 0){
        for(dup of duplicates.rows){
            // Turn the author name into a singular lowercase string with no punctuation
            // let authorName = completeStrip(dup.author);
            // if(authorName === completeStrip(book.author)){
            //     return true;
            // }

            // Now we need to see if the author id is the same as the give information
            const authors = await getBookAuthor(dup);
            const idArr = [];
            for(const author of authors){
                idArr.push(author.id);
            }
            // Now we need to know whether book.author_ids is equal to authors, so we'll need a set
            const authorSet = new Set(book.author_ids + idArr);
            if(authorSet.size === book.author_ids.length){
                // Means that this book with the same title, has the same authors as well
                return true;
            }
        }
    }
    return false;
}

// Check the presence of an array of authors
const checkAuthorPresence = async (author_ids = []) => {
    if(author_ids.length === 0){
        throw new Error("No authors specified");
    }
 
    const query = format("SELECT * FROM authors WHERE id IN (%L)", author_ids);
    const authors = await pool.query(query, []);
 
    if(authors.rows.length === author_ids.length){
        // Means that all authors are valid
        return true;
    }
    return false;
 
 }
 
 // Returns a list of authors who wrote the book
 const getBookAuthor = async (book) => {
     let query = "SELECT a.id, a.given_names, a.surname FROM book_author ba JOIN authors a ON (ba.author_id = a.id) WHERE ba.book_id = $1;"
     const writers = await pool.query(query, [book.id]);
 
     return writers.rows;
 }

// Checks for duplicate entries in the given table
const checkDupEntry = async (entry, tableName) => {
    let query = `SELECT * FROM ${tableName} `;
    let duplicates = [];
    // Different tables have different logic when it comes to finding duplicates
    switch(tableName){
        case "books":
            query += `WHERE title = $1`;
            //console.log(entry[title]);
            if(!entry.hasOwnProperty("title")){
                throw new Error("The entry does not have the book identifier: title");
            }
            duplicates = await pool.query(query, [entry.title]);

            // We need to check whether the book was written by the same person or not
            // if(duplicates.rows.length > 0){

            // }
            return checkDupBook(entry, duplicates);
        case "authors":
            // If an author has the same name and country of origin, then i have no idea
            query += `WHERE surname = $1 AND given_names = $2`
            // Ideally, the books created by this author needs to be checked too
            duplicates = await pool.query(query, [entry.surname, entry.given_names]);
            if(duplicates.rows.length > 0){
                return true;
            }
            break;
    }
    return false;
}

const getAllEntries = async (tableName) => {
    const allEntries = await pool.query(`SELECT * FROM ${tableName}`);
    if(allEntries.rows == 0){
        throw new Error("No entries listed");
    }
    return allEntries.rows;
}

// Code taken from https://stackoverflow.com/questions/21759852/easier-way-to-update-data-with-node-postgres/21763631
const createUpdateQuery = (tableName, conditions = {}, data = {}) => {
    if(!tableName || Object.keys(conditions).length === 0 || Object.keys(data).length === 0){
        return {"query": "", "values": []};
    }
    // Get keys from the given data (e.g., title="Blah". title will be added to dKeys)
    const dKeys = Object.keys(data);
    const dataTuples = dKeys.map((k, index) => `${k} = $${index + 1}`); // Create the update tuples (title = $1)
    const updates = dataTuples.join(", ");
    const len = Object.keys(data).length;

    let query = `UPDATE ${tableName} SET ${updates}`;

    const keys = Object.keys(conditions);
    const condTuples = keys.map((k, index) => `${k} = $${index + 1 + len} `);
    const condPlaceholders = condTuples.join("AND ");

    query += ` WHERE ${condPlaceholders} RETURNING *`;
    
    const values = [];
    Object.keys(data).forEach(key => {
        values.push(data[key]);
    });
    Object.keys(conditions).forEach(key => {
        values.push(conditions[key]);
    });

    return {query, values};
}


// Creates an INSERT query with the given data and tablename
const createInsertQuery = (tableName, data) => {
    if(!tableName || Object.keys(data).length === 0){
        return {"query": "", "values": []};
    }
    
    const dKeys = Object.keys(data);
    const columnNamesStr = dKeys.join(", ");
    const valuesStr = dKeys.map((key, ind) => `$${ind + 1}`).join(", ");
    //const dataTuples = dKeys.map((k, index) => `${k} = $${index + 1}`); // Create the update tuples (title = $1)

    let query = `INSERT INTO ${tableName} (${columnNamesStr}) VALUES(${valuesStr}) RETURNING *`;

    const values = [];
    dKeys.forEach((key) => values.push(data[key]));

    return {query, values};
}

// Truncates the given table
const resetTable = async (table_name) => {
    // Need to check whether table_name is valid or not. Just assume that table_name will always be valid
    const outcome = await pool.query("TRUNCATE TABLE $1", [table_name]);
    console.log("Table has been truncated");
}

module.exports = {
    getAllEntries,
    completeStrip,
    checkDupEntry,
    createUpdateQuery,
    createInsertQuery,
    resetTable,
    getBookAuthor,
    checkAuthorPresence
}