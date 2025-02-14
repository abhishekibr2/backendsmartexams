const ProductCheckout = require("../../models/ProductCheckout");
const logError = require('../../../logger');

const checkoutController = {

    getStudentCheckoutDetails: async (req, res) => {
        try {
            const { userId } = req.params;
            const purchasedBooks = await ProductCheckout.find({ userId: userId })
                .select('orderSummary.eBook.eBookId');
            res.status(200).json({ status: true, data: purchasedBooks });
        } catch (error) {
            logError('Error in getStudentCartDetails:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }

};

module.exports = checkoutController;
