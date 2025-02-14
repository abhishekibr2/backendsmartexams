const eBookPayment = require('../../models/eBookPayment')

const ebookPaymentsController = {
    getAllPayments: async (req, res) => {
        try {
            const payments = await eBookPayment.find().populate('user').populate('eBookId').sort({ _id: -1 })
            res.status(200).json({ status: true, data: payments });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching payments' });
        }
    }
};
module.exports = ebookPaymentsController
