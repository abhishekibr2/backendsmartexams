const TermsCondition = require('../../models/termsCondition');

const termsConditionController = {
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
