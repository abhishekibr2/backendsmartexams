const mongoose = require('mongoose');

const packageTypeSchema = new mongoose.Schema({
    selectedPackage: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const PackageType = mongoose.model('PackageType', packageTypeSchema);



module.exports = PackageType;
