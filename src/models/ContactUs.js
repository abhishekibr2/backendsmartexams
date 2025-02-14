const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema(
	{
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
		messages: [{
			senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
			message: { type: String, required: true, trim: true },
			createdAt: { type: Date, default: Date.now },
		}]
	},
	{ timestamps: true }
);

// Add indexes for performance
contactUsSchema.index({ createdBy: 1 });
contactUsSchema.index({ 'messages.senderId': 1 });

const ContactUs = mongoose.model('ContactUs', contactUsSchema);

module.exports = ContactUs;
