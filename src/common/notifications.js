// notificationController.js
const Notification = require('../models/notifications');
const logError = require('../../logger');

async function createNotification(notificationData) {
	try {
		const newNotification = new Notification(notificationData);
		await newNotification.save();
	} catch (error) {
		logError(error);
	}
}




module.exports = { createNotification };
