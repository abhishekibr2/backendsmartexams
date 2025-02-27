const PackageEssay = require('../../models/packageEssay');
const Package = require('../../models/packageModel');
const SubmittedEssay = require('../../models/submitPackageEssay');
const errorLogger = require('../../../logger');

const packageEssayController = {
    getAllPackageEssay: async (req, res) => {
        try {
            const { packageId, userId } = req.body;

            // Get the package details
            const packageData = await Package.findById(packageId).select('essayTypes');

            if (!packageData) {
                return res.status(404).json({ status: false, message: 'Package not found' });
            }

            // Number of essays allowed per month
            const essaysPerMonth = packageData.essayTypes;

            // Get all submitted essays by the user in this package within the last month
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            const submittedEssays = await SubmittedEssay.find({
                packageId,
                userId,
                createdAt: { $gte: oneMonthAgo } // Only count essays from the last month
            }).sort({ createdAt: -1 }); // Sort by most recent

            // Check if the user has exceeded their essay limit
            if (submittedEssays.length >= essaysPerMonth) {
                const latestSubmissionDate = new Date(submittedEssays[0].createdAt);
                const nextAllowedDate = new Date(latestSubmissionDate);
                nextAllowedDate.setMonth(nextAllowedDate.getMonth() + 1); // Add 1 month

                return res.status(400).json({
                    status: false,
                    message: `You have already submitted ${submittedEssays.length} essay(s) this month. You can submit a new essay after ${nextAllowedDate.toDateString()}.`
                });
            }

            // Fetch all package essays
            const packageEssays = await PackageEssay.find({ packageId }).sort({ _id: -1 });

            res.status(200).json({ status: true, data: packageEssays });
        } catch (error) {
            errorLogger('Error fetching package essays:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = packageEssayController;
