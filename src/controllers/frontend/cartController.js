const Cart = require('../../models/Cart');
const HomepageContent = require('../../models/HomepageContent');
const errorLogger = require('../../../logger');
const { createNotification } = require('../../common/notifications');

const cartController = {
    allCartItems: async (req, res) => {
        try {
            const { userId, coupon, forCheckout } = req.body;
            let couponDiscountPercentage = 0;

            // Fetch the latest active cart for the user
            const activeCart = await Cart.findOne({ userId, status: 'active' })
                .sort({ createdAt: -1 })
                .populate({
                    path: 'eBook.eBookId',
                    select: 'eBookId title price description discountedPrice discount',
                })
                .populate({
                    path: 'package.packageId',
                    select: 'packageName packagePrice packageDiscount packageDescription packageDiscountPrice',
                    populate: {
                        path: 'packageDuration',
                        select: 'DurationTime calculatedTime',
                    },
                });


            if (!activeCart || (activeCart.package.length === 0 && activeCart.eBook.length === 0)) {
                return res.status(200).json({
                    status: true,
                    data: {
                        cart: activeCart || [],
                        packageDetails: { itemTotal: '0.00', discount: '0.00', totalAfterDiscount: '0.00', couponDiscount: '0.00' },
                        eBookDetails: { itemTotal: '0.00', discount: '0.00', totalAfterDiscount: '0.00' },
                        subTotal: '0.00',
                        totalAmount: '0.00',
                    },
                });
            }

            // Check if coupon is provided
            if (coupon) {
                const couponDetail = await HomepageContent.findOne({ couponCode: coupon });
                if (!couponDetail) {
                    return;
                }

                // Ensure the coupon is within valid date range
                const currentDate = new Date();
                if (currentDate < new Date(couponDetail.startTime) || currentDate > new Date(couponDetail.endTime)) {
                    return res.status(400).json({ status: false, message: 'Coupon is not valid at this time' });
                }

                couponDiscountPercentage = parseFloat(couponDetail.discount || 0);
            }

            // Handle checkout-specific coupon logic
            if (forCheckout === 'true') {
                const userCart = await Cart.findOne({ userId, status: 'active' }).select('coupon');
                if (userCart.coupon.isCouponApplied) {
                    couponDiscountPercentage = parseFloat(userCart.coupon.discountPercentage);
                }
            }

            // Calculate package item totals
            const packageDetails = activeCart.package.reduce((acc, pkg) => {
                if (pkg.packageId) {
                    const packagePrice = parseFloat(pkg.packageId.packagePrice || 0);
                    const discountPrice = parseFloat(pkg.packageId.packageDiscountPrice || packagePrice);
                    const quantity = parseInt(pkg.quantity || 1);

                    acc.itemTotal += packagePrice * quantity;
                    acc.discount += (packagePrice - discountPrice) * quantity;
                }
                return acc;
            }, { itemTotal: 0, discount: 0 });

            packageDetails.totalAfterDiscount = packageDetails.itemTotal - packageDetails.discount;
            packageDetails.couponDiscount = (packageDetails.totalAfterDiscount * (couponDiscountPercentage / 100)).toFixed(2);
            const packageTotalAfterCoupon = packageDetails.totalAfterDiscount - parseFloat(packageDetails.couponDiscount);

            // Calculate eBook item totals
            const eBookDetails = activeCart.eBook.reduce((acc, eBook) => {
                if (eBook.eBookId) {
                    const price = parseFloat(eBook.eBookId.price || 0);
                    const discountedPrice = parseFloat(eBook.eBookId.discountedPrice || price);
                    const quantity = parseInt(eBook.quantity || 1);

                    acc.itemTotal += price * quantity;
                    if (price !== discountedPrice) {
                        acc.discount += (price - discountedPrice) * quantity;
                    }
                }
                return acc;
            }, { itemTotal: 0, discount: 0 });

            eBookDetails.totalAfterDiscount = eBookDetails.itemTotal - eBookDetails.discount;

            // Calculate total amounts
            const subTotal = packageTotalAfterCoupon + parseFloat(eBookDetails.totalAfterDiscount);
            const totalAmount = subTotal;

            return res.status(200).json({
                status: true,
                data: {
                    cart: activeCart,
                    packageDetails: {
                        itemTotal: packageDetails.itemTotal.toFixed(2),
                        discount: packageDetails.discount.toFixed(2),
                        totalAfterDiscount: packageDetails.totalAfterDiscount.toFixed(2),
                        couponDiscount: packageDetails.couponDiscount,
                    },
                    eBookDetails: {
                        itemTotal: eBookDetails.itemTotal.toFixed(2),
                        discount: eBookDetails.discount.toFixed(2),
                        totalAfterDiscount: eBookDetails.totalAfterDiscount.toFixed(2),
                    },
                    subTotal: subTotal.toFixed(2),
                    totalAmount: totalAmount.toFixed(2),
                },
            });

        } catch (error) {
            errorLogger(error);
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },

    singleCartItem: async (req, res) => {
        try {
            const { userId, coupon, forCheckout, packageId } = req.body;  // packageId ko request body se le rahe hain
            let couponDiscountPercentage = 0;

            // Fetch the latest active cart for the user
            const activeCart = await Cart.findOne({ userId, status: 'active' })
                .sort({ createdAt: -1 })
                .populate({
                    path: 'package.packageId',
                    select: 'packageName packagePrice packageDiscount packageDescription packageDiscountPrice',
                });

            if (!activeCart || activeCart.package.length === 0) {
                return res.status(200).json({
                    status: true,
                    data: {
                        cart: activeCart || [],
                        packageDetails: { itemTotal: '0.00', discount: '0.00', totalAfterDiscount: '0.00', couponDiscount: '0.00' },
                        subTotal: '0.00',
                        totalAmount: '0.00',
                    },
                });
            }

            // If packageId is provided, filter the activeCart package for the specific packageId
            let selectedPackage = activeCart.package.find(pkg => pkg.packageId._id.toString() === packageId);

            // If the package is not found
            if (!selectedPackage) {
                return res.status(400).json({ status: false, message: 'Package not found in the cart' });
            }

            // Check if coupon is provided
            if (coupon) {
                const couponDetail = await HomepageContent.findOne({ couponCode: coupon });
                if (!couponDetail) {
                    return;
                }

                // Ensure the coupon is within valid date range
                const currentDate = new Date();
                if (currentDate < new Date(couponDetail.startTime) || currentDate > new Date(couponDetail.endTime)) {
                    return res.status(400).json({ status: false, message: 'Coupon is not valid at this time' });
                }

                couponDiscountPercentage = parseFloat(couponDetail.discount || 0);
            }

            // Handle checkout-specific coupon logic
            if (forCheckout === 'true') {
                const userCart = await Cart.findOne({ userId, status: 'active' }).select('coupon');
                if (userCart.coupon.isCouponApplied) {
                    couponDiscountPercentage = parseFloat(userCart.coupon.discountPercentage);
                }
            }

            // Calculate package item totals for the selected package
            const packagePrice = parseFloat(selectedPackage.packageId.packagePrice || 0);
            const discountPrice = parseFloat(selectedPackage.packageId.packageDiscountPrice || packagePrice);
            const quantity = parseInt(selectedPackage.quantity || 1);

            let packageDetails = {
                itemTotal: packagePrice * quantity,
                discount: (packagePrice - discountPrice) * quantity,
            };

            packageDetails.totalAfterDiscount = packageDetails.itemTotal - packageDetails.discount;
            packageDetails.couponDiscount = (packageDetails.totalAfterDiscount * (couponDiscountPercentage / 100)).toFixed(2);
            const packageTotalAfterCoupon = packageDetails.totalAfterDiscount - parseFloat(packageDetails.couponDiscount);

            // Calculate total amounts
            const subTotal = packageTotalAfterCoupon;
            const totalAmount = subTotal;

            return res.status(200).json({
                status: true,
                data: {
                    cart: activeCart,
                    packageDetails: {
                        itemTotal: packageDetails.itemTotal.toFixed(2),
                        discount: packageDetails.discount.toFixed(2),
                        totalAfterDiscount: packageDetails.totalAfterDiscount.toFixed(2),
                        couponDiscount: packageDetails.couponDiscount,
                    },
                    subTotal: subTotal.toFixed(2),
                    totalAmount: totalAmount.toFixed(2),
                },
            });

        } catch (error) {
            errorLogger(error);
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },



    addToCartDetails: async (req, res) => {
        try {
            const { userId, packageId, eBookId, quantity } = req.body;

            if (!userId || (!packageId && !eBookId)) {
                return res.status(400).json({ status: false, message: 'Invalid request data' });
            }

            const existingCart = await Cart.findOne({ userId });

            const updateOrAddItem = (items, itemId, itemKey) => {
                const index = items.findIndex(item => item[itemKey].toString() === itemId);

                if (index > -1) {
                    items[index].quantity = (parseInt(items[index].quantity) + parseInt(quantity)).toString();
                    return 'updated';
                } else {
                    items.push({ [itemKey]: itemId, quantity });
                    return 'added';
                }
            };

            let notificationType = 'create';
            let notificationMessage = 'New item has been added to the cart successfully.';

            if (existingCart) {
                if (packageId) {
                    notificationType = updateOrAddItem(existingCart.package, packageId, 'packageId') === 'updated' ? 'update' : 'create';
                } else if (eBookId) {
                    notificationType = updateOrAddItem(existingCart.eBook, eBookId, 'eBookId') === 'updated' ? 'update' : 'create';
                }
                notificationMessage = notificationType === 'update'
                    ? 'Item has been updated in the cart successfully.'
                    : 'New item has been added to the cart successfully.';
                await existingCart.save();
            } else {
                const newCart = new Cart({
                    userId,
                    package: packageId ? [{ packageId, quantity }] : [],
                    eBook: eBookId ? [{ eBookId, quantity }] : [],
                });
                await newCart.save();
            }

            const updatedCart = await Cart.findOne({ userId });
            const totalCount = (updatedCart.package || []).reduce((acc, item) => acc + item.quantity, 0) +
                (updatedCart.eBook || []).reduce((acc, item) => acc + item.quantity, 0);

            createNotification({
                notification: notificationMessage,
                type: notificationType,
                notifyBy: userId,
                notifyTo: userId,
                createdAt: new Date(),
                url: '/cart',
            });

            res.status(200).json({ status: true, message: notificationMessage, totalCount });
        } catch (error) {
            errorLogger('Unexpected error:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },


    removeCartItem: async (req, res) => {
        try {
            const { packageId, eBookId, userId } = req.body;

            // Find the user's cart
            const existingCart = await Cart.findOne({ userId: userId });
            if (!existingCart) {
                return res.status(404).json({ status: false, message: 'Cart not found' });
            }

            let itemIndex = -1;
            let itemType = '';
            if (packageId) {
                itemIndex = existingCart.package.findIndex((item) => item.packageId.toString() === packageId);
                itemType = 'package';
            } else if (eBookId) {
                itemIndex = existingCart.eBook.findIndex((item) => item.eBookId.toString() === eBookId);
                itemType = 'eBook';
            }

            // Handle item not found in the respective list
            if (itemIndex === -1) {
                return res.status(404).json({ status: false, message: 'Item not found in the cart' });
            }

            // Remove the item based on its type
            if (itemType === 'package') {
                existingCart.package.splice(itemIndex, 1);
            } else if (itemType === 'eBook') {
                existingCart.eBook.splice(itemIndex, 1);
            }

            // Save updated cart
            await existingCart.save();

            // Create a notification
            const createNotificationMessage = {
                notification: `Item has been removed from the cart successfully.`,
                type: 'delete',
                notifyBy: userId,
                notifyTo: userId,
                createdAt: new Date(),
                url: '/cart',
            };
            createNotification(createNotificationMessage);

            // Respond with success
            return res.status(200).json({ status: true, message: 'Item deleted successfully' });
        } catch (error) {
            errorLogger(error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
                error: error.message,
            });
        }
    },

    updateCartItemQuantity: async (req, res) => {
        try {
            const { userId, packageId, eBookId, type } = req.body;
            const existingCart = await Cart.findOne({ userId });

            if (!existingCart) {
                return res.status(404).json({ status: false, message: 'Cart not found' });
            }

            const updateQuantity = (items, itemId, itemType) => {
                const index = items.findIndex((item) => item[itemType].toString() === itemId);
                if (index > -1) {
                    if (type === 'increase') {
                        items[index].quantity++;
                        return { success: true, message: `${itemType === 'packageId' ? 'Package' : 'Ebook'} quantity increased successfully` };
                    } else if (type === 'decrease' && items[index].quantity > 1) {
                        items[index].quantity--;
                        return { success: true, message: `${itemType === 'packageId' ? 'Package' : 'Ebook'} quantity decreased successfully` };
                    } else {
                        return { success: false, message: `${itemType === 'packageId' ? 'Package' : 'Ebook'} quantity cannot be decreased below 1` };
                    }
                }
                return { success: false, message: `${itemType === 'packageId' ? 'Package' : 'Ebook'} not found in the cart` };
            };

            let result;
            if (packageId) {
                result = updateQuantity(existingCart.package, packageId, 'packageId');
            } else if (eBookId) {
                result = updateQuantity(existingCart.eBook, eBookId, 'eBookId');
            } else {
                return res.status(400).json({ status: false, message: 'Invalid request data' });
            }

            if (result.success) {
                await existingCart.save();

                const createNotificationMessage = {
                    notification: result.message,
                    type: 'update',
                    notifyBy: userId,
                    notifyTo: userId,
                    createdAt: new Date(),
                    url: '/cart',
                };
                createNotification(createNotificationMessage);

                return res.status(200).json({ status: true, message: result.message });
            } else {
                return res.status(400).json({ status: false, message: result.message });
            }
        } catch (err) {
            errorLogger(err);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    validateCouponCode: async (req, res) => {
        try {
            const { couponCode, userId } = req.body;

            const existingCart = await Cart.findOne({ userId });
            if (!existingCart) {
                return res.status(400).json({
                    status: false,
                    message: 'No active cart found for the user.',
                });
            }

            const coupon = await HomepageContent.findOne({ couponCode: couponCode });
            if (!coupon) {
                return res.status(404).json({
                    status: false,
                    message: 'Invalid coupon code.',
                });
            }

            const currentTime = new Date();
            const startTime = new Date(coupon.startTime);
            const endTime = new Date(coupon.endTime);

            if (currentTime < startTime) {
                return res.status(400).json({
                    status: false,
                    message: 'This coupon is not valid yet.',
                });
            }

            if (currentTime > endTime) {
                return res.status(400).json({
                    status: false,
                    message: 'This coupon has expired.',
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Valid',
                data: {
                    couponCode: coupon.couponCode,
                    discount: coupon.discount
                },
            });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
    applyCouponCode: async (req, res) => {
        try {
            const { userId, couponCode } = req.body;
            const existingCart = await Cart.findOne({ userId });
            if (!existingCart) {
                return res.status(400).json({ status: false, message: 'No active cart found for the user.' });
            }
            if (couponCode) {
                const coupon = await HomepageContent.findOne({ couponCode: couponCode });
                if (!coupon) {
                    return res.status(404).json({ status: false, message: 'Invalid coupon code.' });
                }

                const currentTime = new Date();
                const startTime = new Date(coupon.startTime);
                const endTime = new Date(coupon.endTime);
                if (currentTime < startTime) {
                    return res.status(400).json({ status: false, message: 'This coupon is not valid yet.' });
                }
                if (currentTime > endTime) {
                    return res.status(400).json({ status: false, message: 'This coupon has expired.' });
                }

                existingCart.coupon = {
                    couponCode: couponCode,
                    discountPercentage: coupon.discount,
                    isCouponApplied: true,
                };

                await existingCart.save();

                return res.status(200).json({
                    status: true,
                    message: 'Coupon applied successfully.',
                    data: {
                        cart: existingCart,
                        discount: coupon.discount,
                    },
                });
            } else {
                existingCart.coupon = {
                    couponCode: '',
                    discountPercentage: 0,
                    isCouponApplied: false,
                }
                await existingCart.save();
                return res.status(200).json({
                    status: true,
                    message: 'Coupon removed successfully.',
                    data: {
                        cart: existingCart,
                    },
                });
            }
        } catch (error) {
            errorLogger(error);
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    }


}
module.exports = cartController
