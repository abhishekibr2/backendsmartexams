/* eslint-disable no-mixed-spaces-and-tabs */
const User = require('../../models/Users');
const catchErrors = require('../../middleware/catchErrors');
const { STRIPE_SECRET_KEY } = '../../config/envConfig.js';
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const errorLogger = require('../../../logger');
const bcrypt = require('bcrypt');
const { createNotification } = require('../../common/notifications');

const profileController = {
	storeCardDetail: catchErrors(async (req, res) => {
		const { cardNumber, cardHolderName, expiryDate, cvv, userId, email } = req.body;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		let customerId = user.stripeCustomerId;
		if (!customerId) {
			const customer = await stripe.customers.create({
				name: cardHolderName,
				email: email
			});
			customerId = customer.id;
			user.stripeCustomerId = customer.id;
			await user.save();
		}

		const [expYear, expMonth] = expiryDate.split('-').map(Number);

		const paymentMethod = await stripe.paymentMethods.create({
			type: 'card',
			card: {
				number: cardNumber,
				exp_month: expMonth,
				exp_year: expYear,
				cvc: cvv
			}
		});

		await stripe.paymentMethods.attach(paymentMethod.id, { customer: customerId });

		res.status(200).json({ success: true, data: paymentMethod });
	}),

	getAllCard: catchErrors(async (req, res) => {
		const { customerId } = req.body;
		const paymentMethods = await stripe.paymentMethods.list({
			customer: customerId,
			type: 'card'
		});

		const cards = paymentMethods.data.map((method) => ({
			id: method.id,
			brand: method.card.brand,
			last4: method.card.last4,
			expMonth: method.card.exp_month,
			expYear: method.card.exp_year,
			customer: customerId
		}));

		res.status(200).json({ success: true, data: cards, paymentMethods: paymentMethods });
	}),
	deleteCard: catchErrors(async (req, res) => {
		const { cardId } = req.body;

		const paymentMethod = await stripe.paymentMethods.detach(cardId);
		res.status(200).json({ success: true, data: paymentMethod });
	}),
	updatePassword: async (req, res) => {
		try {
			const id = req.params.id;
			const { currentPassword, newPassword } = req.body;

			const user = await User.findById(id).populate('roleId');

			if (!user) {
				return res.status(404).json({ message: 'User not found', status: false });
			}

			const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

			if (!isPasswordMatch) {
				return res.status(400).json({ message: 'Current password not matched', status: false });
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);

			user.password = hashedPassword;
			await user.save();

			const userNotificationData = {
				notification: `Hi  <strong>${user.name}</strong> Your password has been updated successfully.`, // Customize the notification message as needed
				notifyBy: user._id, // Assuming the user ID is used for notification
				notifyTo: user._id, // Notify the user who updated their profile
				type: 'profile_update',
				url: `/${user.roleId.roleName}/edit-profile`
			};

			createNotification(userNotificationData);

			res.json({ message: 'Password updated successfully', status: true });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
};

module.exports = profileController;
