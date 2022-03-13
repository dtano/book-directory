const express = require("express");
//const {sequelize} = require("./config/db_setup");
const {db} = require("./models/index");

// Need to include all models
// const Dummy = require("./models/Dummy");

//db.sequelize.sync().then(() => console.log("Sync success"));

// db.sequelize
// .authenticate()
// .then(() => {
//   console.log('Connection has been established successfully.');
// })
// .catch(err => {
//   console.error('Unable to connect to the database:', err);
// });

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