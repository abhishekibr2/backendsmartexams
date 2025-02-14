const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homepageContentSchema = new Schema({
    heading: { type: String, required: false },
    couponCode: { type: String, required: false },
    discount: { type: Number, required: false },
    startTime: { type: String, required: false },
    endTime: { type: String, required: false },
    bannerDescription: { type: String, required: false },
    description: { type: String, required: false },
    image: { type: String, required: false },
    secondHeading: { type: String, required: false },

    headingOne: { type: String, required: false },
    descriptionOne: { type: String, required: false },
    imageOne: { type: String, required: false },
    buttonOne: { type: String, required: false },

    headingTwo: { type: String, required: false },
    subHeadingTwo: { type: String, required: false },
    sectionTwoTitleOne: { type: String, required: false },
    sectionTwoTitleTwo: { type: String, required: false },
    sectionTwoTitleThree: { type: String, required: false },
    sectionTwoTitleFour: { type: String, required: false },
    sectionTwoTitleFive: { type: String, required: false },
    sectionTwoTitleSix: { type: String, required: false },
    sectionTwoImageOne: { type: String, required: false },
    sectionTwoImageTwo: { type: String, required: false },
    sectionTwoImageThree: { type: String, required: false },
    sectionTwoImageFour: { type: String, required: false },
    sectionTwoImageFive: { type: String, required: false },
    sectionTwoImageSix: { type: String, required: false },



    headingThree: { type: String, required: false },
    subHeadingThree: { type: String, required: false },
    descriptionThree: { type: String, required: false },
    stateHeading: { type: String, required: false },

    headingFour: { type: String, required: false },
    descriptionFour: { type: String, required: false },
    cardTextOne: { type: String, required: false },
    cardTextTwo: { type: String, required: false },
    cardTextThree: { type: String, required: false },
    cardTextFour: { type: String, required: false },
    cardCountOne: { type: String, required: false },
    cardCountTwo: { type: String, required: false },
    cardCountThree: { type: String, required: false },
    cardCountFour: { type: String, required: false },


});

const HomepageContent = mongoose.model('HomepageContent', homepageContentSchema);
module.exports = HomepageContent;
