const SubmitPackageEssay = require('../../models/submitPackageEssay');
const errorLogger = require('../../../logger');
const { createNotification } = require('../../common/notifications');

const submitPackageEssayController = {

	submitPackageEssayDetails: async (req, res) => {
		try {
			const durationInSeconds = req.body.durationInSeconds || 0;
			const minutes = Math.floor(durationInSeconds / 60);
			const seconds = durationInSeconds % 60;

			const newSubmitPackageEssay = new SubmitPackageEssay({
				packageId: req.body.packageId,
				userId: req.body.userId,
				packageEssayId: req.body.packageEssayId,
				description: req.body.description,
				createdBy: req.body.createdBy,
				duration: { minutes, seconds }, // Save timer duration

			});

			const savedEssay = await newSubmitPackageEssay.save();

			const StudentNotificationData = {
				notification: 'Essay has been submitted successfully',
				notifyBy: req.body.createdBy,
				notifyTo: req.body.createdBy,
				type: 'submit Essay',
			};

			await createNotification(StudentNotificationData);
			return res.status(200).json({
				status: true,
				message: 'Essay submitted successfully',
				data: savedEssay
			});
		} catch (error) {
			errorLogger('Error submitting essay:', error);
			return res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},


};

module.exports = submitPackageEssayController;
