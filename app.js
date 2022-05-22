const express = require('express');
const cors = require("cors");
const db = require('./models/index');

// Import routes
const bookRoute = require('./routes/book');
const authorRoute = require('./routes/author');
const userRoute = require('./routes/user');

const app = express();

// Attach the routes
app.use(cors());
app.use(express.json());

app.use('/api/book', bookRoute);
app.use('/api/author', authorRoute);
app.use('/api/user', userRoute);

module.exports = app;
