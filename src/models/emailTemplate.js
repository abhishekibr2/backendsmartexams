const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
	name: { type: String, default: null },
	emailLogo: { type: String, default: null },
	footerImage: { type: String, default: null },
	subject: { type: String, default: null },
	template: { type: String, default: null },
	type: { type: String, default: null },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null, index: true },
	createdAt: { type: Date, default: Date.now, index: true },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	updatedAt: { type: Date, default: Date.now },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	deletedAt: { type: Date, default: Date.now }
});

const emailTemplate = mongoose.model('emailTemplate', emailTemplateSchema);

module.exports = emailTemplate;
