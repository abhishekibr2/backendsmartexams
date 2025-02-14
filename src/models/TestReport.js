const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const testReportSchema = new Schema({
    testAttemptId: {
        type: Schema.Types.ObjectId,
        ref: 'TestAttempt',
        required: true
    },
    report: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalQuestion: {
        type: Number,
        default: 0
    },
    correntAnswer: {
        type: Number,
        default: 0
    },
    incorrectAnswer: {
        type: Number,
        default: 0
    },
    unansweredQuestion: {
        type: Number,
        default: 0
    },
    skippedQUestion: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    timeTaken: {
        type: Number,
        default: 0
    }
})

const TestReport = mongoose.model('TestReport', testReportSchema)

module.exports = TestReport;
