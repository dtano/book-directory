const {User} = require('../models/User');

const userService = {
    createUser: async (details) => {
        const user = await User.create(details);

        return user;
    },

    getUser: async () => {

    },

    updateUser: async () => {

    },

    deleteUser: async () => {

    }
}

module.exports = userService;