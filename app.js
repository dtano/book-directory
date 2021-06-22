const express = require("express");

// TO-DO
// - Make table creation functions
// - Separate the database related functions from the others in general.js
//      - Maybe create a separate file for these database functions alongside the
//        create functions

// Import routes
const bookRoute = require("./Routes/book");
const authorRoute = require("./Routes/author");

const app = express();

// Attach the routes
app.use(express.json());
app.use("/api/book", bookRoute);
app.use("/api/author", authorRoute);

module.exports = app;