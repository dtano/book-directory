const authorValidator = {
    validate: (authorInformation) => {
        authorValidator.areBirthAndDeathDatesValid(authorInformation.birth_date, authorInformation.death_date);
    },

    areBirthAndDeathDatesValid: (birthDate, deathDate) => {
        if(birthDate === null && deathDate === null) return;

        let birthDateObj = new Date(birthDate);
        let deathDateObj = new Date(deathDate);

        if(birthDateObj > deathDateObj){
            throw new Error('Date of death can\'t be before date of birth');
        }
    }
}

module.exports = authorValidator;