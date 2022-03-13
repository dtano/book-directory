const express = require("express");
const {sequelize} = require("./config/db_setup");

// Need to include all models
const Dummy = require("./models/Dummy");

sequelize.sync().then(() => console.log("Sync success"));

// Import routes
const bookRoute = require("./routes/book");
const authorRoute = require("./routes/author");

const app = express();

// Attach the routes
//app.use(express.urlencoded);
app.use(express.json());
app.use("/api/book", bookRoute);
app.use("/api/author", authorRoute);

module.exports = app;