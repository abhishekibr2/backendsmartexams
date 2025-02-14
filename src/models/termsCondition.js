const mongoose = require('mongoose');

const termsConditionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
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

const TermsCondition = mongoose.model('TermsCondition', termsConditionSchema);

module.exports = TermsCondition;
