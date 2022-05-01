const authorService = require('../authorService');
const {Author, Book} = require('../../models/');
const Op = require('../../models/index').Sequelize.Op; 
const {areArraysEqualSets, isNullOrEmpty} = require('../../controllers/general');


const EXPECTED_AUTHOR_FIELD = 'author_ids';

const NO_AUTHOR_ERROR = 'No author(s) specified';
const AUTHOR_PRESENCE_ERROR = 'At least one of the specified authors does not exist in the database';

const bookValidator = {
    validate: async (bookDetails) => {
        if(!bookValidator.doesRequestContainAuthors(bookDetails)){
            throw new Error(NO_AUTHOR_ERROR);
        }
        
        const areAuthorsPresent = await bookValidator.checkAuthorPresence(bookDetails.author_ids);
        if(!areAuthorsPresent) throw new Error(AUTHOR_PRESENCE_ERROR);
    }, 
    
    doesRequestContainAuthors: (details) => {
        const detailKeys = Object.keys(details);
        for(const key of detailKeys){
            if(key === EXPECTED_AUTHOR_FIELD) return true;
        }
        
        return false;
    },
    
    checkAuthorPresence: async (authorIds) => {
        const whereCondition = {
            id: {
                [Op.in]: authorIds,
            }
        };
    
        const authors = await authorService.findAllAuthors(whereCondition);
    
        if(authors === null || authors.length !== authorIds.length){
            return false;
        }

        return true;
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

        if(isNullOrEmpty(foundBook)) return false;

        // Now compare authors
        const possibleDuplicateAuthorsIds = foundBook.dataValues.Authors.map(
            author => author.id);

        if(areArraysEqualSets(authorIds, possibleDuplicateAuthorsIds)){
            return true;
        }

        return false;
    }
}

module.exports = bookValidator;