const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
	name: { type: String, index: true, default: null },
	slug: { type: String, index: true, default: null },
	gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
	profileImage: { type: String, default: null },
	designation: { type: String, default: null },
	description: { type: String, default: null },
	linkedin: { type: String, default: null },
	facebook: { type: String, default: null },
	twitter: { type: String, default: null },
	instagram: { type: String, default: null },
	status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'member', default: null },
	createdAt: { type: Date, default: Date.now },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'member', default: null },
	updatedAt: { type: Date, default: Date.now },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'member', default: null },
	deletedAt: { type: Date, default: Date.now }
});

const author = mongoose.model('author', authorSchema);

module.exports = author;
