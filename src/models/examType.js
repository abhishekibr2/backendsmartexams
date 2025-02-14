const mongoose = require('mongoose');

const examTypeSchema = new mongoose.Schema({
    stateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'state',
        default: null
    },
    complexityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'complexity',
        default: null
    },
    examType: {
        type: String,
        default: null
    },
    slug: {
        type: String,
        default: null
    },
    eligibility: {
        type: String,
        default: null
    },
    duration: {
        type: Number,
        default: null
    },
    onlineAvailability: {
        type: String,
        default: null
    },
    testSubjects: {
        type: String,
        default: null
    },

    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    updatedAt: { type: Date, default: Date.now },
});

const ExamType = mongoose.model('examType', examTypeSchema);

module.exports = ExamType;
