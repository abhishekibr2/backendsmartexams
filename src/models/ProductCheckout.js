const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'package', default: null },
    packageName: { type: String, default: null },
    packagePrice: { type: Number, default: null },
    packageQuantity: { type: Number, default: null },
    packageDiscount: { type: Number, default: null },
    packageDiscountPrice: { type: Number, default: null },
    packageValidity: {
        durationTime: { type: String, default: null },
        calculatedTime: { type: Date, default: null }
    }
});

const eBookSchema = new mongoose.Schema({
    eBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'package', default: null },
    eBookTitle: { type: String, default: null },
    eBookPrice: { type: Number, default: null },
    eBookDiscount: { type: Number, default: null },
    eBookDiscountPrice: { type: Number, default: null },
    eBookQuantity: { type: Number, default: null },
})

const productCheckoutSchema = new mongoose.Schema(
    {
        firstName: { type: String, default: null },
        lastName: { type: String, default: null },
        country: { type: String, default: null },
        streetAddress1: { type: String, default: null },
        streetAddress2: { type: String, default: null },
        townCity: { type: String, default: null },
        state: { type: String, default: null },
        zipCode: { type: String, default: null },
        phone: { type: String, default: null },
        email: { type: String, default: null },
        terms: { type: Boolean, default: false },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null, index: true },
        orderSummary: {
            package: [packageSchema],
            eBook: [eBookSchema],
            coupon: {
                isCouponApplied: { type: Boolean, default: false },
                couponCode: { type: String, default: null },
                discountPercentage: { type: Number, default: 0 },
                totalCouponDiscount: { type: Number, default: 0 }
            },
            subTotal: { type: Number, default: null },
            totalAmount: { type: Number, default: null },
            paymentMethod: { type: String, default: null },
            paymentStatus: {
                type: String,
                enum: ['pending', 'paid', 'failed', 'refunded', 'completed'],
                default: 'pending',
            },
        },
        paymentIntentId: { type: String, default: null },
        clientSecret: { type: String, default: null },
        stripeCustomerId: { type: String, default: null },
        paymentMethodId: { type: String, default: null },
        currency: { type: String, default: 'USD' },
        transactionStatus: { type: String, enum: ['requires_payment_method', 'requires_confirmation', 'succeeded', 'failed'], default: 'requires_payment_method' },
        status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
    },
    { timestamps: true }
);

const ProductCheckouts = mongoose.model('productCheckouts', productCheckoutSchema);

module.exports = ProductCheckouts;
