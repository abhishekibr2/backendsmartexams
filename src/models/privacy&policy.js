const mongoose = require('mongoose');

const privacyPolicy = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

const TermsCondition = mongoose.model('Privacy&POlicy', privacyPolicy);

module.exports = TermsCondition;
