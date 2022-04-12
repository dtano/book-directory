const {isEmpty, isNullOrEmpty, deleteFile} = require('../../controllers/general');
const requestValidator = {
    validateBodyKeys: (body, Model) => {
        if(isNullOrEmpty(body)) return false;

        //throw new Error(`No ${Model.name} information is defined`);

        return false;
    }
}

module.exports = requestValidator;