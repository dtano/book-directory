const express = require('express');
const db = require('./models/index');

// Import routes
const bookRoute = require('./routes/book');
const authorRoute = require('./routes/author');

const app = express();

// Attach the routes
app.use(express.json());

app.use('/api/book', bookRoute);
app.use('/api/author', authorRoute);

module.exports = app;
