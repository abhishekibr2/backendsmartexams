const mongoose = require('mongoose');

const packageEssaySchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    essayName: { type: String, default: null },
    essayType: { type: String, default: null },
    duration: { type: String, default: null },
    addedTotalEssay: { type: Number, default: null },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    updatedAt: { type: Date, default: Date.now },
});

const PackageEssay = mongoose.model('packageEssay', packageEssaySchema);

module.exports = PackageEssay;

