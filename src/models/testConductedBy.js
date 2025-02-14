const mongoose = require('mongoose');

const testConductedBySchema = new mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    updatedAt: { type: Date, default: Date.now },
});

const TestConducted = mongoose.model('testConductedBy', testConductedBySchema);

module.exports = TestConducted;
