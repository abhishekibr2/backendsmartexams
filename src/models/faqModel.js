const mongoose = require('mongoose');
const faqSchema = new mongoose.Schema(
    {
        questions: {
            type: String,
            default: null
        },
        answer: {
            type: String,
            default: null
        },
        pages: {
            type: String,
            default: null
        },
        stateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'state',
            default: null,

        },
        examTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'examType',
            default: null,

        },
        orderBy: {
            type: Number,
            default: 0
        },
        deletedAt: {
            type: Date,
            default: null
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    }
);

module.exports = mongoose.model('Faq', faqSchema);
