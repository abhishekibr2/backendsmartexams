const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({

    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'package',
    },
    questionFeedback: {
        like: {
            type: Boolean,
            default: null,
        },
        dislike: {
            type: Boolean,
            default: null,
        },
    },
    difficultyFeedback: {
        like: {
            type: Boolean,
            default: null,
        },
        dislike: {
            type: Boolean,
            default: null,
        },
    },
    technicalFeedback: {
        like: {
            type: Boolean,
            default: null,
        },
        dislike: {
            type: Boolean,
            default: null,
        },
    },
    comment: {
        type: String,
        trim: true,

    },
}, { timestamps: true });

// Create a Mongoose model based on the schema
const Feedback = mongoose.model('PackageFeedback', feedbackSchema);

module.exports = Feedback;
