const {Author, Book} = require('../models/');
const {isEmpty, isNullOrEmpty, deleteFile} = require('../controllers/general');
const path = require('path');

// Where images will be stored in the project directory
const authorImgPath = path.join(__dirname, '../public/uploads/authors/');

const authorService = {
    createAuthor: async (details) => {
        try{
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
        const author = await authorService.findAuthor({id: authorId});
        const previousValues = author.dataValues;
        
        const [ rowsUpdated, [updatedAuthor] ] = await Author.update(newInformation, {
            returning: true, 
            where: {id: authorId}
        });

        if(rowsUpdated == 0){
            throw new Error(`Failed to update author with id = ${authorId}`);
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

        return {author, numDeletedEntries};
    }
}

const updateAuthorInstance = (author, newInformation) => {
    const keys = Object.keys(newInformation);
    for(const key of keys){
        author[key] = newInformation[key];
    }
}

module.exports = authorService;