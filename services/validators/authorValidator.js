const authorValidator = {
    validate: (authorInformation) => {
        authorValidator.isDeathDateGreaterThanBirthDate(authorInformation.birth_date, authorInformation.death_date);
        authorValidator.isDatePossible(authorInformation.birth_date);
        authorValidator.isDatePossible(authorInformation.death_date);
    },

    isDeathDateGreaterThanBirthDate: (birthDate, deathDate) => {
        if((!birthDate || birthDate.length === 0) || (!deathDate || deathDate.length === 0)) return;

        let birthDateObj = new Date(birthDate);
        let deathDateObj = new Date(deathDate);

        if(birthDateObj > deathDateObj){
            throw new Error('Validation Error: Date of death must be greater than date of birth');
        }
    },

    isDatePossible: (date) => {
        if(!date || date.length === 0) return;

        if(new Date(date) > new Date()) throw new Error('Validation Error: Given date cannot be greater than current date!');
    }
}

module.exports = authorValidator;