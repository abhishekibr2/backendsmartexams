const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({

    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
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
const Feedback = mongoose.model('QuestionFeedback', feedbackSchema);

module.exports = Feedback;
