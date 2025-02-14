const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attemptQuestionSchema = new Schema({
    testAttemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestAttempt',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    answerId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionOption'
    }],
    userAnswer: {
        type: String,
        default: null
    },
    correctAnswer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionOption'
    }],
    isCorrect: {
        type: Boolean,
        default: false
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    timeInSec: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: [
            'completed',
            'incomplete',
            'skipped',
            'answerFlagged',
            'unanswerFlagged',
            'answered',
            'unanswered',
            'notVisited'
        ],
        default: 'incomplete'
    }
});

const AttemptQuestion = mongoose.model('AttemptQuestion', attemptQuestionSchema);

module.exports = AttemptQuestion;
