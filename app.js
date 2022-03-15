const express = require('express');
const db = require('./models/index');
const PORT = process.env.PORT;

// Import routes
const bookRoute = require('./routes/book');
const authorRoute = require('./routes/author');

const app = express();

// Attach the routes
app.use(express.json());

app.use('/api/book', bookRoute);
app.use('/api/author', authorRoute);

app.listen(PORT, async () => {
  console.log(`Server is listening on port ${PORT}`);
  await db.sequelize.sync();
});

module.exports = app;
