const {Author, Book} = require('../models/');
const {deleteFile, isNullOrEmpty, isEmpty} = require('../controllers/general');
const Op = require('../models/index').Sequelize.Op; 

const path = require('path');

// Where images will be stored in the project directory
const authorImgPath = path.join(__dirname, '../public/uploads/authors/');

const authorService = {
    createAuthor: async (details) => {
        try{
            if(isNullOrEmpty(details)){
                throw new Error('Request body is empty');
            }

            const [row, created] = await Author.findOrCreate({
                where: details,
            });
    
            if(!created) throw new Error(`Author with the given information already exists`);
    
            return row;
    
        }catch(err){
            console.log(err.message);
            throw err;
        }
    },

    findAuthor: async (conditions) => {
        const author = await Author.findOne({
            where: conditions,
            include: Book,
        });

        return author;
    },

    findAllAuthors: async (conditions = {}) => {
        const authors = await Author.findAll({
            where: conditions,
            include: Book,
        });

        return authors;
    },

    updateAuthor: async (authorId, newInformation) => {
        if(isEmpty(req.body)) throw new Error(`Request body is empty`);
        
        const author = await authorService.findAuthor({id: authorId});
        const previousValues = author.dataValues;
        
        const [ rowsUpdated, [updatedAuthor] ] = await Author.update(newInformation, {
            returning: true, 
            where: {id: authorId}
        });

        if(rowsUpdated == 0){
            throw new Error(`Failed to update author with id = ${authorId}`);
        }

        if(previousValues.profile_picture != updatedAuthor.dataValues.profile_picture){
            authorService.deleteProfilePicture(previousValues.profile_picture);
        }

        return {updatedAuthor, previousValues};
    },

    deleteAuthor: async (authorId) => {
        const author = await authorService.findAuthor({id: authorId});

        if(author == null) throw new Error(`Author with id = ${authorId} does not exist`);

        for(const book of author.Books){
            await author.removeBook(book);
        }
      
        const numDeletedEntries = await Author.destroy({
            where: {
                id: authorId,
            },
        });

        if(numDeletedEntries === 0){
            throw new Error(`Failed to delete author with id = ${authorId}`);
        }

        authorService.deleteProfilePicture(author.profile_picture);

        return {author, numDeletedEntries};
    },

    checkAuthorPresence: async (authorIds = []) => {
        if (authorIds.length === 0) {
            throw new Error('No authors specified');
        }
    
        const authors = await authorService.findAllAuthors({
            id: {
                [Op.in]: authorIds, 
            }
        });
    
        if (authors.length === authorIds.length) {
        // Means that all authors are valid
            return [true, authors];
        }
        return [false, null];
    }, 

    deleteProfilePicture: (profilePictureName) => {
        if(profilePictureName != null){
            deleteFile(`${authorImgPath}${profilePictureName}`);
        }
    }
}

module.exports = authorService;