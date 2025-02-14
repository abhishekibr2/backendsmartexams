const TermsCondition = require('../../models/termsCondition');


const termsConditionController = {
    addUpdate: async (req, res) => {
        const { _id } = req.body;
        try {
            const updatedTermsCondition = await TermsCondition.findByIdAndUpdate(
                _id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedTermsCondition) {
                return res.status(404).json({
                    message: 'Terms and conditions not found.',
                    success: false,
                });
            }
            return res.status(200).json({
                message: 'Terms and conditions updated successfully.',
                success: true,
                data: updatedTermsCondition,
            });
        } catch (error) {
            console.error('Error updating terms and conditions:', error);
            return res.status(500).json({
                message: 'An error occurred while updating terms and conditions.',
                success: false,
                error: error.message,
            });
        }
    },
    getTermsCondition: async (req, res) => {
        try {
            const testimonials = await TermsCondition.find()
            res.status(200).json({ status: true, data: testimonials });
        } catch (error) {
            console.error('Error getting terms and conditions:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

}
module.exports = termsConditionController
