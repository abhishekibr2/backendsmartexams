const mongoose = require('mongoose');

const FrontendHomePageSchema = new mongoose.Schema({
    sectionOneTitle1: {
        type: String,
        required: true,
    },
    sectionOneTitle2: {
        type: String,
        required: true,
    },
    sectionOneTitle3: {
        type: String,
        required: true,
    },
    sectionOneDescription: {
        type: String,
        required: false
    },
    sectionTwoTitle1: {
        type: String,
        required: true,
    },
    sectionTwoDescription1: {
        type: String,
        required: false
    },
    sectionTwoTitle2: {
        type: String,
        required: true,
    },
    sectionTwoDescription2: {
        type: String,
        required: false
    },
    sectionTwoTitle3: {
        type: String,
        required: true,
    },
    sectionTwoDescription3: {
        type: String,
        required: false
    },
    sectionThreeTitle: {
        type: String,
        required: true,
    },
    sectionThreeDescription: {
        type: String,
        required: false
    },
    sectionFourTitle: {
        type: String,
        required: true,
    },
    sectionFourDescription: {
        type: String,
        required: false
    },
    status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },
},);

const HomepageContent = mongoose.model('HomepageContent', FrontendHomePageSchema);
module.exports = HomepageContent;
