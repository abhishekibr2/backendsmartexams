const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
        orderDate: { type: Date, default: Date.now },
        transactionId: { type: String, default: null },
        paymentId: { type: String, default: null },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        country: { type: String, default: null },
        address: { type: String, required: true },
        city: { type: String, default: null },
        state: { type: mongoose.Schema.Types.ObjectId, ref: 'state', default: null },
        zipCode: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true },
        paymentMethod: { type: String, required: true },
        subTotalPrice: { type: Number, default: null },
        totalPrice: { type: Number, default: null },
        taxPrice: { type: Number, default: null },
        status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    },
    { timestamps: null }
);

module.exports = mongoose.model('Order', OrderSchema);
