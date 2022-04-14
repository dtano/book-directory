const authorService = require('../authorService');
const Op = require('../../models/index').Sequelize.Op; 
const EXPECTED_AUTHOR_FIELD = 'author_ids';

const NO_AUTHOR_ERROR = 'No author(s) specified';
const AUTHOR_PRESENCE_ERROR = 'At least one of the specified authors does not exist in the database';

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
    }
}

module.exports = bookValidator;