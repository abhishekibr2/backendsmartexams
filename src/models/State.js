const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    title: { type: String, default: null },
    slug: { type: String, default: null },
    description: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    createdAt: { type: Date, index: true, default: Date.now },
    updatedAt: { type: Date, index: true, default: Date.now },
    deletedAt: { type: Date, index: true, default: Date.now }
});

const State = mongoose.model('state', stateSchema);

module.exports = State;
