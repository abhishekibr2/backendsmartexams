const mongoose = require('mongoose');

const submitPackageEssaySchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: false },
    packageEssayId: { type: mongoose.Schema.Types.ObjectId, ref: 'packageEssay', required: false },
    description: { type: String, default: null },
    duration: {
        minutes: { type: Number, default: 0 }, // Minutes field
        seconds: { type: Number, default: 0 }, // Seconds field
    }, comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            comment: { type: String },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    createdAt: { type: Date, index: true, default: Date.now },
    updatedAt: { type: Date, index: true, default: Date.now },
    deletedAt: { type: Date, index: true, default: Date.now }
});

const State = mongoose.model('submitPackageEssay', submitPackageEssaySchema);

module.exports = State;
