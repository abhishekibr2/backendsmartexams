const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
	notification: { type: String, default: null },
	notifyBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null, index: true },
	notifyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null, index: true },
	url: { type: String, default: null },
	type: { type: String, default: null, index: true },
	tag: { type: String, default: null },
	isRead: { type: String, enum: ['yes', 'no'], default: 'no', index: true },
	status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active', index: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null, index: true },
	createdAt: { type: Date, index: true, default: Date.now },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	updatedAt: { type: Date, default: Date.now },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	deletedAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('notifications', notificationSchema);

module.exports = Notification;
