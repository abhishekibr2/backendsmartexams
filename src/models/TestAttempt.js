const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const testAttemptSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    testReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestReport',
        default: null
    },
    attempt: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: 0
    },
    timeTaken: {
        type: Number,
        default: 0
    },
    mode: {
        type: String,
        enum: ['tutor', 'exam', 'preview'],
        default: 'tutor'
    },
    timer: {
        type: String,
        enum: ['timed', 'untimed']
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    attemptQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AttemptQuestion'
    }],
    isCompleted: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema)

module.exports = TestAttempt;
