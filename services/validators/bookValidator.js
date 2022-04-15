const authorService = require('../authorService');
const {Author, Book} = require('../../models/');
const Op = require('../../models/index').Sequelize.Op; 
const {areArraysEqualSets, isNullOrEmpty} = require('../../controllers/general');


const EXPECTED_AUTHOR_FIELD = 'author_ids';

const NO_AUTHOR_ERROR = 'No author(s) specified';
const AUTHOR_PRESENCE_ERROR = 'At least one of the specified authors does not exist in the database';
const DUPLICATE_BOOK_ERROR = 'Duplicate book already exists';

const bookValidator = {
    validate: async (bookDetails) => {
        bookValidator.doesRequestContainAuthors(bookDetails);
        await bookValidator.checkAuthorPresence(bookDetails.author_ids);
    }, 
    
    doesRequestContainAuthors: (details) => {
        const detailKeys = Object.keys(details);
        for(const key of detailKeys){
            if(key === EXPECTED_AUTHOR_FIELD) return;
        }
    
        throw new Error(NO_AUTHOR_ERROR);
    },
    
    checkAuthorPresence: async (authorIds) => {
        const whereCondition = {
            id: {
                [Op.in]: authorIds,
            }
        };
    
        const authors = await authorService.findAllAuthors(whereCondition);
    
        if(authors === null || authors.length !== authorIds.length){
            throw new Error(AUTHOR_PRESENCE_ERROR);
        }
    },

    isDuplicateBook: async (bookDetails, authorIds) => {
        const queryBody = {
            title: bookDetails.title,
            pages: bookDetails.pages,
            date_published: bookDetails.date_published
        };

        const foundBook = await Book.findOne({
            where: queryBody,
            include: Author
        });

        if(isNullOrEmpty(foundBook)) return;

        // Now compare authors
        const possibleDuplicateAuthorsIds = foundBook.dataValues.Authors.map(
            author => author.id);

        if(areArraysEqualSets(authorIds, possibleDuplicateAuthorsIds)){
            throw new Error(DUPLICATE_BOOK_ERROR);
        }
    }
}

module.exports = bookValidator;