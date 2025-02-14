const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema({
	email: { type: String, required: true, index: true, default: null },
	phoneNumber: { type: String, default: null },
	otp: { type: Number, default: null },
	expiryTime: { type: Date, default: Date.now, index: true },
	createdAt: { type: Date, default: Date.now, index: true },
	updatedAt: { type: Date, default: Date.now }
});

const EmailOtp = mongoose.model('EmailOtp', emailOtpSchema);

module.exports = EmailOtp;
