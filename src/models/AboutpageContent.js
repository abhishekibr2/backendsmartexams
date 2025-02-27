const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AboutPageContentSchema = new Schema({
    headingOne: { type: String, required: false },
    descriptionOne: { type: String, required: false },
    buttonText: { type: String, required: false },
    image: { type: String, required: false },

    headingTwo: { type: String, required: false },
    descriptionTwo: { type: String, required: false },

    headingThree: { type: String, required: false },
    descriptionThree: { type: String, required: false },
    descriptionFour: { type: String, required: false },

    imageCardOne: { type: String, required: false },
    headingCardOne: { type: String, required: false },
    descriptionCardOne: { type: String, required: false },

    imageCardTwo: { type: String, required: false },
    headingCardTwo: { type: String, required: false },
    descriptionCardTwo: { type: String, required: false },


    imageCardThree: { type: String, required: false },
    headingCardThree: { type: String, required: false },
    descriptionCardThree: { type: String, required: false },

});

const AboutPageContent = mongoose.model('AboutPageContent', AboutPageContentSchema);
module.exports = AboutPageContent;
