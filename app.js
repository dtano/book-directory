const express = require("express");

// Import routes
const bookRoute = require("./Routes/book");
const authorRoute = require("./Routes/author");

const app = express();

// Attach the routes
app.use(express.json());
app.use("/api/book", bookRoute);
app.use("/api/author", authorRoute);

module.exports = app;