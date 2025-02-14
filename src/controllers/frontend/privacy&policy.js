const privacySchema = require('../../models/privacy&policy');

const PrivacyController = {
    getPrivacyPolicy: async (req, res) => {
        try {
            const testimonials = await privacySchema.find()
            res.status(200).json({ status: true, data: testimonials });
        } catch (error) {
            console.error('Error getting terms and conditions:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}
module.exports = PrivacyController
