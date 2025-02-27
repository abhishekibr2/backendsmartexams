const mongoose = require('mongoose');
const testFeedbackSchema = new mongoose.Schema({

    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
    },
    testAttemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestAttempt',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
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

const Feedback = mongoose.model('testFeedBack', testFeedbackSchema);

module.exports = Feedback;
