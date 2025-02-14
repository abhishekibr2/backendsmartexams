const mongoose = require('mongoose');

const durationSchema = new mongoose.Schema(
    {
        DurationTime: {
            type: String,
            required: true,
            default: null,
        },
        durationOption: {
            type: String,
            required: true,
            enum: ['days', 'weeks', 'months', 'years'],
        },
        calculatedTime: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'deleted', 'suspended'],
            default: 'active',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            default: null,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Duration = mongoose.model('Duration', durationSchema);

module.exports = Duration;
