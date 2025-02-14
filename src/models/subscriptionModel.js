const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Subscription = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		default: null
	},
	endpoint: String,
	expirationTime: Number,
	keys: {
		p256dh: String,
		auth: String
	}
});

module.exports = mongoose.model('subscription', Subscription);
