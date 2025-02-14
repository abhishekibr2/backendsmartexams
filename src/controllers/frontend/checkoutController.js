const Order = require('../../models/Order');
const errorLogger = require('../../../logger');
const { createNotification } = require('../../common/notifications');

const cartController = {
    allOrders: async (req, res) => {
        try {
            const activeAndLatestOrders = await Order.find({ status: 'active' })
                .sort({ createdAt: -1 })
                .populate('packageId');

            res.status(200).json({ status: true, data: activeAndLatestOrders });
        } catch (error) {
            console.log(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    addOrderDetails: async (req, res) => {
        try {
            const { userId, packageId, price, quantity } = req.body;
            // Create a new Cart
            const newCart = new Order({
                userId: userId,
                packageId: packageId,
                subTotalPrice: price * quantity,
                totalPrice: price,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zipCode,
                country: req.body.country,
                orderStatus: 'completed',
                paymentStatus: 'pending',
                createdBy: userId || null,
            });
            await newCart.save();
            const createNotificationMessage = {
                notification: `New Order has been added successfully.`,
                type: 'create',
                notifyBy: req.body.userId,
                notifyTo: req.body.userId,
                createdAt: new Date(),
                url: '/cart',  // Update the URL if necessary
            };
            // Call the function to create the notification (send it to the relevant user)
            createNotification(createNotificationMessage);
            return res.status(200).json({ status: true, message: 'Order added successfully' });
        } catch (error) {
            errorLogger('Unexpected error:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    }
}
module.exports = cartController
