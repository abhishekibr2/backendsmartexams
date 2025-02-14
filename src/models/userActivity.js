const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'users'
	},
	activityMessage: {
		type: String,
		required: true
	},
	timestamp: { type: Date, default: Date.now }
});

const userActivity = mongoose.model('userActivity', userActivitySchema);

module.exports = userActivity;
