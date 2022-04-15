const {Author, Book} = require('../models/');
const bookValidator = require('./validators/bookValidator');
const {isEmpty, isNullOrEmpty} = require('../controllers/general');

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

module.exports = bookService;

