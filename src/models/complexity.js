const mongoose = require('mongoose');

const complexityTypeSchema = new mongoose.Schema({
    complexityLevel: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    updatedAt: { type: Date, default: Date.now },
});

const Complexity = mongoose.model('complexity', complexityTypeSchema);

module.exports = Complexity;
