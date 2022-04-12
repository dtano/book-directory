const requestValidator = require('../../services/validators/requestValidator');
const db = require('../../models');


describe('Validation of request body structure', () => {
    it('Should correctly validate request body based on specified model, when the information is accurate', () => {
        const requestBody = {
            given_names: 'Bilbo',
            surname: 'Baggins',
            country_origin: 'England'
        }

        const isValid = requestValidator.validateBodyKeys(requestBody, db.Author);

        expect(isValid).toBe(true);
    });
})