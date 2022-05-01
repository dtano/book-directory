const {User} = require('../models/');
const {validateRequestBody} = require('../controllers/general');

const userService = {
    createUser: async (details) => {
        const user = await User.create(details);

        return user;
    },

    getUser: async (conditions) => {
        const user = await User.findOne({
            where: conditions,
        });

        return user;
    },

    updateUser: async () => {

    },

    deleteUser: async () => {

    },

    validateRequestBody: (body) => {
        return validateRequestBody(User, body);
    }
}

module.exports = userService;