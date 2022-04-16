const {Author, Book} = require('../models/');
const authorService = require('./authorService');
const bookValidator = require('./validators/bookValidator');
const {isEmpty, isNullOrEmpty, checkArrayContent, checkUniqueness, validateRequestBody} = require('../controllers/general');

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

        return {book, previousBookValues};
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

