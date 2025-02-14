const mongoose = require('mongoose');

const testimonialsSchema = new mongoose.Schema({
	name: { type: String, index: true, default: null },
	image: { type: String, index: true, default: null },
	description: { type: String, index: true, default: null },
	designation: { type: String, index: true, default: null },
	pages: [{
		type: String,
		default: null
	}],
	state: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'state',
		default: null,

	},
	examType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'examType',
		default: null,

	},
	status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active', index: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null, index: true },
	createdAt: { type: Date, default: Date.now, index: true },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	updatedAt: { type: Date, default: Date.now },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	deletedAt: { type: Date, default: Date.now }
});

const testimonials = mongoose.model('testimonials', testimonialsSchema);

module.exports = testimonials;
