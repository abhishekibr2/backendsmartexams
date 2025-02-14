const privacySchema = require('../../models/privacy&policy');

const privacyPolicyController = {
    addPrivacyPolicy: async (req, res) => {
        const { _id } = req.body;
        try {
            const updatedTermsCondition = await privacySchema.findByIdAndUpdate(
                _id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedTermsCondition) {
                return res.status(404).json({
                    message: 'Privacy and Policy not found.',
                    success: false,
                });
            }
            return res.status(200).json({
                message: 'Privacy and Policy updated successfully.',
                success: true,
                data: updatedTermsCondition,
            });
        } catch (error) {
            console.error('Error updating Privacy and Policy:', error);
            return res.status(500).json({
                message: 'An error occurred while updating Privacy and Policy.',
                success: false,
                error: error.message,
            });
        }
    },
    getPrivacyPolicy: async (req, res) => {
        try {
            const privacyPolicy = await privacySchema.find()
            res.status(200).json({ status: true, data: privacyPolicy });
        } catch (error) {
            console.error('Error getting Privacy and Policy:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}

module.exports = privacyPolicyController;
