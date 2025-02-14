const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    package: [
        {
            packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
            quantity: { type: Number, default: 1 },
        },
    ],
    eBook: [
        {
            eBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'ebook', required: true },
            quantity: { type: Number, default: 1 },
        },
    ],
    coupon: {
        isCouponApplied: { type: Boolean, default: false },
        couponCode: { type: String, default: null },
        discountPercentage: { type: Number, default: 0 },
    },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
