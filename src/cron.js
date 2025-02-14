const cron = require('node-cron');
const subscriptionModel = require('./models/subscriptionModel');
const { sendNotification } = require('./utils/subscribeNotification');

const importantEventPayload = {
	title: 'Important Event',
	description: 'Something important happened!',
	image: 'https://rentstayable.com/wp-content/uploads/2023/05/cropped-fav-192x192.png'
};

cron.schedule('*/10 * * * * *', async () => {
	try {
		const subscriptions = await subscriptionModel.find();

		for (const subscription of subscriptions) {
			await sendNotification(subscription, importantEventPayload);
		}
	} catch (error) {
		console.error('Error sending notifications:', error);
	}
});
