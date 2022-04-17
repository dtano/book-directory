const {Author, Book} = require('../models/');
const path = require('path');
const authorService = require('./authorService');
const bookValidator = require('./validators/bookValidator');
const {isNullOrEmpty, deleteFile, checkArrayContent, checkUniqueness, validateRequestBody} = require('../controllers/general');

const bookCoverPath = path.join(__dirname, '../public/uploads/bookCovers/');

const AUTHOR_LINK_ERROR = 'Failed to establish a link between book and author(s)';

const bookService = {
    createBook: async (details, authorIds) => {
        await bookValidator.isDuplicateBook(details, authorIds);
        
        const book = await Book.create(details);

        const bookWithAuthors = await linkBookToAuthors(book, authorIds);

        if(isNullOrEmpty(bookWithAuthors)){
            throw new Error(AUTHOR_LINK_ERROR);
        }

        return bookWithAuthors;
    },

    findBook: async (conditions) => {
        const book = await Book.findOne({
            where: conditions,
            include: Author,
        });

        return book;
    },

    findAllBooks: async (conditions = {}) => {
        const books = await Book.findAll({
            where: conditions,
            include: Author,
        });

        return books;
    },

    updateBook: async (bookId, bookChanges = {}, authorChanges = {}) => {
        let book = await bookService.findBook({id: bookId});
        
        if(!book) throw new Error(`Book with id = ${bookId} not found`);
        const previousBookValues = book.dataValues;

        if(bookChanges == null && authorChanges == null){
            throw new Error('The request body is not of the correct format');
        }

        if(bookChanges){
            if(!validateRequestBody(Book, bookChanges)){
                throw new Error(`The keys for model: ${Book.name} are wrong`);
            }

            book = await book.update(bookChanges);
        }

        if(authorChanges){
            book = await changeAuthor(book, authorChanges.authorsToRemove, authorChanges.authorsToAdd);
        }

        if(previousBookValues.cover != book.cover){
            // Means that the cover was updated, therefore delete old one
            bookService.deleteCover(previousBookValues.cover);
        }

        return {book, previousBookValues};
    }, 

    deleteBook: async (bookId) => {
        const book = await bookService.findBook({id: bookId});

        if(!book) throw new Error(`Book with id = ${bookId} does not exist`);

        const authorIdsToRemove = book.dataValues.Authors.map(authorObj => authorObj.id);
        await removeAuthorsFromBook(book, authorIdsToRemove);

        const isBookDeleted = await Book.destroy({
            where: {
              id: bookId,
            }
        });

        if(!isBookDeleted){
            throw new Error(`Failed to delete book with id: ${bookId}`);
        }

        bookService.deleteCover(book.cover);

        return deletedBook;
    },

    deleteMultipleBooks: async (bookIdsToDelete) => {
        if(isNullOrEmpty(bookIdsToDelete)) throw new Error('No books to delete');
        const booksToDelete = await bookService.findAllBooks({ id: bookIdsToDelete });

        if(booksToDelete.length !== bookIdsToDelete.length){
            // Find the ids that are not legal
            const existingBookIds = booksToDelete.map((book) => book.id);
            const nonExistantBookIds = bookIdsToDelete.filter((id) => !existingBookIds.includes(id));

            return {status: false, body: nonExistantBookIds};
        }

        for(const book of booksToDelete){
            const authorsToRemove = book.dataValues.Authors.map(authorObj => authorObj.id);
            await removeAuthorsFromBook(book, authorsToRemove);
            await book.destroy();

            bookService.deleteCover(book.cover);
        }

        return {status: true, body: booksToDelete}
    }, 

    deleteCover: (coverPictureName) => {
        if(coverPictureName != null){
            deleteFile(`${bookCoverPath}${coverPictureName}`);
        }
    }
};

const linkBookToAuthors = async (bookObj, authorIds) => {
    if(authorIds.length === 0) return {};

    let authors = [];
    for(const authorId of authorIds){
        const author = await Author.findOne({
            where: {
                id: authorId,
            }
        });

        if(!isNullOrEmpty(author)){
            authors.push(author);
        }
    }

    await bookObj.setAuthors(authors);

    const bookWithAuthors = await bookService.findBook({id: bookObj.id});

    return bookWithAuthors;
}

const changeAuthor = async (bookToUpdate, authorsToRemove = [], authorsToAdd = []) => {
    if(!bookToUpdate) throw new Error('Given book to update is null');

    const bookAuthorIds = bookToUpdate.Authors.map((author) => author.dataValues.id);

    // Checks whether all ids in authorsToRemove is present in the array of authors for this book
    if (authorsToRemove.length > 0 && !checkArrayContent(bookAuthorIds, authorsToRemove)) {
        throw new Error('Invalid author ids to remove');
    }

    if(authorsToAdd.length > 0){
        const [authorValid, foundAuthors] = await authorService.checkAuthorPresence(authorsToAdd);
        if(!authorValid){
            throw new Error('At least one of the authors to add don\'t exist in the database');
        }

        if(!checkUniqueness(bookAuthorIds, authorsToAdd)){
            throw new Error('At least one of the authors is already credited with writing this book');
        }
    }

    await removeAuthorsFromBook(bookToUpdate, authorsToRemove);
    const bookWithNewAuthors = await linkBookToAuthors(bookToUpdate, authorsToAdd);

    return bookWithNewAuthors;
}

const removeAuthorsFromBook = async (book, authorsToRemove) => {
    if(authorsToRemove.length === 0) return {};

    for(const authorId of authorsToRemove){
        const authorToRemove = await authorService.findAuthor({id: authorId});

        if(!authorToRemove) continue;

        await book.removeAuthor(authorToRemove);
    }
}

module.exports = bookService;

