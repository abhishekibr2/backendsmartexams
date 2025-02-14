const Cart = require("../../models/Cart");
const logError = require('../../../logger');

const cartController = {
    getStudentCartDetails: async (req, res) => {
        try {
            const { userId } = req.params;
            const cart = await Cart.findOne({ userId }).select('packages eBook');

            if (!cart) {
                return res.status(200).json({ success: true, totalCount: 0 });
            }

            const totalCount = (cart.package || []).reduce((acc, item) => acc + item.quantity, 0) +
                (cart.eBook || []).reduce((acc, item) => acc + item.quantity, 0);

            res.status(200).json({ status: true, data: cart, totalCount });
        } catch (error) {
            logError('Error in getStudentCartDetails:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }



};

module.exports = cartController;
