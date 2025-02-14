const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PurchasedPackageSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    packageId: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    expirationDate: {
        type: Date,
        default: null
    },
    isTrial: {
        type: Boolean,
        default: false
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    isRefunded: {
        type: Boolean,
        default: false
    },
    isFree: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
});

const PurchasedPackage = mongoose.model('PurchasedPackage', PurchasedPackageSchema);

module.exports = PurchasedPackage;
