const mongoose = require('mongoose');

const reportProblemSchema = new mongoose.Schema(
    {
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Test',
            required: true
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        issueType: {
            type: String,
            enum: ['Incorrect Question', 'Wrong Answer', 'Technical Issue', 'Other'],
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
            default: 'Pending'
        },
        responseMessage: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

const ReportProblem = mongoose.model('ReportProblem', reportProblemSchema);

module.exports = ReportProblem;
