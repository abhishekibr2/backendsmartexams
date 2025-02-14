const Notification = require('../../models/notifications');
const logError = require('../../../logger');

const notificationController = {
	notification: async (req, res) => {
		const userId = req.params.id;

		try {
			const notification = await Notification.find({ notifyTo: userId }).populate('notifyBy', 'name email').sort({ _id: -1 });

			if (!notification) {
				return res.status(404).json({ status: false, message: 'Notification not found' });
			}
			res.status(200).json({ status: true, data: notification });
		} catch (error) {
			logError('Error fetching notification:', error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	updateAllReadStatus: async (req, res) => {
		try {
			const { userId, isRead } = req.body;
			const updatedNotifications = await Notification.updateMany({ notifyTo: userId }, { $set: { isRead } });
			res.status(200).json({
				success: true,
				message: 'All notifications have been marked as read.',
				data: updatedNotifications
			});
		} catch (error) {
			logError(`Error updating notification status: ${error.message}`);
			res.status(500).json({ success: false, message: 'Internal server error' });
		}
	},
	deleteAllMessages: async (req, res) => {
		try {
			const { userId, notificationIds } = req.body;
			// const updatedNotifications = await Notification.deleteMany({ notifyTo: userId });
			const updatedNotifications = await Notification.deleteMany({ _id: { $in: notificationIds }, notifyTo: userId });

			res.status(200).json({
				success: true,
				message: 'All notifications have been deleted.',
				data: updatedNotifications
			});
		} catch (error) {
			logError(`Error updating notification status: ${error.message}`);
			res.status(500).json({ success: false, message: 'Internal server error' });
		}
	},
	deleteMessage: async (req, res) => {
		try {
			const { userId, notificationId } = req.body;
			const updatedNotifications = await Notification.deleteOne({ _id: notificationId, notifyTo: userId });
			res.status(200).json({
				success: true,
				message: 'Notification has been deleted.',
				data: updatedNotifications
			});
		} catch (error) {
			logError(`Error deleting notification: ${error.message}`);
			res.status(500).json({ success: false, message: 'Internal server error' });
		}
	}
};

module.exports = notificationController;
