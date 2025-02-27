const SubmitPackageEssay = require('../../models/submitPackageEssay');
const ProductCheckouts = require('../../models/ProductCheckout');
const PackageModel = require('../../models/packageModel');
const errorLogger = require('../../../logger');
const { createNotification } = require('../../common/notifications');

const submitPackageEssayController = {

	getSubmitPackageEssay: async (req, res) => {
		try {
			const { userId } = req.query

			const query = { status: 'active' };

			if (userId) {
				query.userId = userId;
			}

			const getEssay = await SubmitPackageEssay.find(query).sort({ createdAt: -1 }).populate('packageId').populate('packageEssayId').populate('userId');

			const purachasedPackages = await ProductCheckouts.find({ userId: userId });

			// Extract all package IDs from purchased packages
			const packageIds = purachasedPackages
				.flatMap(p => p.orderSummary.package.map(pkg => pkg.packageId))
				.filter(id => id); // Remove null values



			const totalEssayTypes = await PackageModel.aggregate([
				{ $match: { _id: { $in: packageIds } } },
				{ $group: { _id: null, count: { $sum: "$essayTypes" } } }]);

			const totalEssays = totalEssayTypes.length > 0 ? totalEssayTypes[0].count : 0;

			return res.status(200).json({
				status: true,
				data: { getEssay, totalEssays } // Changed key to `totalEssays`
			});

		} catch (error) {
			errorLogger('Error submitting essay:', error);
			return res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getPackageEssayById: async (req, res) => {
		try {
			const { essayId } = req.params;

			const essay = await SubmitPackageEssay.findById(essayId)
				.populate('packageId')
				.populate('packageEssayId')
				.populate('userId');

			if (!essay) {
				return res.status(404).json({ status: false, message: 'Essay not found' });
			}
			return res.status(200).json({
				status: true,
				message: 'Essay details fetched successfully',
				data: essay,
			});
		} catch (error) {
			errorLogger('Error fetching essay:', error);
			return res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	updatePackageEssay: async (req, res) => {
		try {
			const { essayId } = req.params;
			const { comment, userId, updatedBy } = req.body;

			const essay = await SubmitPackageEssay.findById(essayId);
			if (!essay) {
				return res.status(404).json({ status: false, message: 'Essay not found' });
			}
			essay.comments.push({
				userId,
				comment,
				createdAt: new Date(),
			});
			const updatedEssay = await essay.save();

			const StudentNotificationData = {
				notification: 'Essay has been updated with new comments',
				notifyBy: updatedBy,
				notifyTo: updatedBy,
				type: 'update Essay',
			};
			await createNotification(StudentNotificationData);

			return res.status(200).json({
				status: true,
				message: 'Essay updated with new comment successfully',
				data: updatedEssay,
			});
		} catch (error) {
			errorLogger('Error updating essay:', error);
			return res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	}

};

module.exports = submitPackageEssayController;
