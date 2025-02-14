const mongoose = require('mongoose');

const forumViewCountSchema = new mongoose.Schema({
	forumId: { type: mongoose.Schema.Types.ObjectId, ref: 'forums', required: true },
	country: { type: String, default: null },
	countryCode: { type: String, default: null },
	regionName: { type: String, default: null },
	city: { type: String, default: null },
	district: { type: String, default: null },
	zip: { type: String, default: null },
	lat: { type: Number, default: null },
	lon: { type: Number, default: null },
	timezone: { type: String, default: null },
	isp: { type: String, default: null },
	ipAddress: { type: String, default: null },
	timestamp: { type: Date, default: Date.now },
	operatingSystem: { type: String, default: null },
	browserName: { type: String, default: null },
	deviceName: { type: String, default: null }
});

const ForumViewCount = mongoose.model('forumViewCount', forumViewCountSchema);

module.exports = ForumViewCount;
