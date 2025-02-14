const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
	brandName: { type: String, default: null },
	logo: { type: String, default: null },
	favIcon: { type: String, default: null },
	waterMarkIcon: { type: String, default: null },
	tagLine: { type: String, default: null },
	email: { type: String, default: null },
	emailPassword: { type: String, default: null },
	phone: { type: String, default: null },
	address: { type: String, default: null },
	googleMap: { type: String, default: null },
	whatsApp: { type: String, default: null },
	website: { type: String, default: null },
	time: { type: String, default: null },
	footerDescriptionOne: { type: String, default: null },
	footerDescriptionTwo: { type: String, default: null },
	footerSubHeadingOne: { type: String, default: null },
	footerSubHeadingTwo: { type: String, default: null },

	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	payment: {
		stripeTestKey: { type: String, default: null },
		stripeLiveKey: { type: String, default: null },
		paypalTestKey: { type: String, default: null },
		paypalLiveKey: { type: String, default: null },
		paymentMode: { type: String, default: null }
	},
	seo: {
		googleAnalytics: { type: String, default: null },
		searchConsole: { type: String, default: null },
		hotJar: { type: String, default: null },
		mailChimp: { type: String, default: null }
	},
	socialLinks: {
		facebook: { type: String, default: null },
		twitter: { type: String, default: null },
		instagram: { type: String, default: null },
		linkedIn: { type: String, default: null }
	},
	emailSignature: { type: String, default: null },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
	createdAt: { type: Date, index: true, default: Date.now },
	updatedAt: { type: Date, index: true, default: Date.now },
	deletedAt: { type: Date, index: true, default: Date.now },
});

const AdminSettings = mongoose.model('adminSettings', adminSettingsSchema);

module.exports = AdminSettings;
