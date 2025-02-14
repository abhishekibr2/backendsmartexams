const mongoose = require('mongoose');

const whyChooseUsSchema = new mongoose.Schema({
    heading: { type: String },
    titleOne: { type: String },
    descriptionOne: { type: String },
    titleTwo: { type: String },
    descriptionTwo: { type: String },
    titleThree: { type: String },
    descriptionThree: { type: String },
    titleFour: { type: String },
    descriptionFour: { type: String },
    status: { type: String, default: 'active' },
    IconOne: { type: String, default: null },
    IconTwo: { type: String, default: null },
    IconThree: { type: String, default: null },
    IconFour: { type: String, default: null },


    achievementsHeading: { type: String },
    countOne: { type: Number },
    countOneDesc: { type: String },
    countTwo: { type: Number },
    countTwoDesc: { type: String },
    countThree: { type: Number },
    countThreeDesc: { type: String },
    countFour: { type: Number },
    countFourDesc: { type: String },

    coreHeading: { type: String, },
    numberOneCore: { type: String },
    descriptionCore: { type: String },
    numberTwoCore: { type: String },
    descriptionTwoCore: { type: String },
    numberThreeCore: { type: String },
    descriptionThreeCore: { type: String },
    numberFourCore: { type: String },

    numberFiveCore: { type: String },
    descriptionFiVeCore: { type: String },
    numberSixCore: { type: String },
    descriptionSixCore: { type: String },

    descriptionFourCore: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const whyChooseUsModel = mongoose.model('WhyChooseUs', whyChooseUsSchema);
module.exports = whyChooseUsModel;
