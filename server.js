const app = require("./app.js");

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

//module.exports = server;


/*
    ------------ TO-DO ------------

    1. Create a book json object
    2. Create a route that allows users to add books
    3. Create a route that gets books based on id or title
    4. Store the books in a database (use SQL)
      - Create a book database
      - Create an author table? Or database?
      - Create a book table?
    5. Once you have succeeded with the previous steps, try creating an author object and link it with the book
    6. Create the frontend for this app (Do this when you know some React)
*/