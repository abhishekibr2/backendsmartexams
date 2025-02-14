const catchErrors = require('../middleware/catchErrors');
const subscriptionModel = require('../models/subscriptionModel');
const webPush = require('web-push');
const { WebPushError } = require('web-push');
const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = require('../config/envConfig');

const subscribeNotification = catchErrors(async (req, res) => {
	try {
		if (req.user) {
			const existingEndPointCount = await subscriptionModel
				.find({ endpoint: req.body.endpoint, userId: req.user._id })
				.countDocuments();
			if (existingEndPointCount === 0) {
				const newSubscription = await subscriptionModel.create({
					...req.body,
					userId: req.user._id
				});

				const options = {
					vapidDetails: {
						subject: 'mailto:arjun.binarydata@gmail.com',
						publicKey: VAPID_PUBLIC_KEY,
						privateKey: VAPID_PRIVATE_KEY
					}
				};

				const payload = JSON.stringify({
					title: 'Welcome to Our Service!',
					body: 'Thank you for subscribing to notifications.',
					icon: 'https://example.com/notification-icon.png',
					badge: 'https://example.com/notification-badge.png'
				});

				await webPush.sendNotification(newSubscription, payload, options);
			}
		}
		res.sendStatus(200);
	} catch (error) {
		console.error('Error subscribing to notifications:', error);
		res.status(500).json({ error: 'Failed to subscribe to notifications' });
	}
});

const sendNotification = async (subscription, payload) => {
	try {
		const options = {
			vapidDetails: {
				subject: 'mailto:arjun.binarydata@gmail.com',
				publicKey: VAPID_PUBLIC_KEY,
				privateKey: VAPID_PRIVATE_KEY
			}
		};

		await webPush.sendNotification(subscription, JSON.stringify(payload), options);
	} catch (error) {
		if (error instanceof WebPushError && error.statusCode === 410) {
			// Handle expired subscription or invalid endpoint
			console.error('Subscription expired or invalid:', error);
		} else {
			console.error('Error sending notification:', error);
		}
	}
};

module.exports = { subscribeNotification, sendNotification };
