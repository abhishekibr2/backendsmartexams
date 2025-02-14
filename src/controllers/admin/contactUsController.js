const ContactUs = require('../../models/ContactUs');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');

const contactUsController = {
	getContactUsController: async (req, res) => {
		try {
			const users = await ContactUs.find().sort({ _id: -1 }).populate('createdBy');
			if (!users) {
				return res.status(404).json({ status: false, message: 'No contact-us data found' });
			}
			res.status(200).json({ status: true, data: users });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getContactUsData: async (req, res) => {
		try {
			const { createdBy } = req.params;
			const contactUs = await ContactUs.findOne({
				'messages.senderId': createdBy
			}).populate('messages.senderId', 'image name');
			if (!contactUs) {
				return res.status(404).json({
					success: false,
					message: 'Not found',
				});
			}
			res.status(200).json({
				success: true,
				data: contactUs,
			});
		} catch (error) {
			errorLogger(error);
			res.status(500).json({
				success: false,
				message: 'Internal server error'
			})
		}
	},


	deleteContactUs: async (req, res) => {
		try {
			const ids = Array.isArray(req.body.id) ? req.body.id : [req.body.id];
			if (!ids || ids.length === 0) {
				return res.status(400).json({ message: 'No valid IDs provided', status: false });
			}

			const objectIdArray = ids.map((id) => new mongoose.Types.ObjectId(id));
			const deleteResult = await ContactUs.deleteMany({ _id: { $in: objectIdArray } });

			if (deleteResult.deletedCount === 0) {
				return res.status(404).json({ message: 'No contacts found to delete', status: false });
			}

			res.status(200).json({ success: true, message: 'Contact-us deleted successfully' });
		} catch (error) {
			console.error('Error in deleteContactUs:', error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	// addContactUs: async (req, res) => {
	// 	try {
	// 		const newContactUs = new ContactUs(req.body);
	// 		await newContactUs.save();
	// 		res.status(200).json({ status: true, message: 'Contact-us added successfully' });
	// 	} catch (error) {
	// 		errorLogger(error);
	// 		res.status(500).json({ status: false, message: 'Internal Server Error' });
	// 	}
	// }
	submitContactUsMessage: async (req, res) => {
		try {
			const { userId, createdBy, message } = req.body;

			if (!createdBy || !message) {
				return res.status(400).json({
					success: false,
					message: 'User ID and message are required'
				});
			}
			let contactUs = await ContactUs.findOne({ createdBy: createdBy });

			if (!contactUs) {
				contactUs = new ContactUs({
					createdBy: createdBy,
					messages: [{ senderId: userId, message }],
				});

				await contactUs.save();

				return res.status(201).json({
					success: true,
					message: 'Message submitted successfully',
					data: contactUs,
				});
			}

			contactUs.messages.push({ senderId: userId, message });
			await contactUs.save();

			return res.status(200).json({
				success: true,
				message: 'Message updated successfully',
				data: contactUs,
			});
		} catch (error) {
			errorLogger('Error in submitContactUsMessage:', error);
			res.status(500).json({
				success: false,
				message: 'Server Error'
			});
		}
	},

};
module.exports = contactUsController;
