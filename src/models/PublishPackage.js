const mongoose = require('mongoose');
const { Schema } = mongoose;


const PublishPackageSchema = new Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'state', default: null },
    durationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Duration', default: null },
    examTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'examType', default: null },
    packageImage: [{
        path: String,
        filename: String,

    }],
    price: { type: Number, default: null },
    discount: { type: Number, default: null },
    description: { type: String, default: null },
    title: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
},
    { timestamps: null }
);

const PublishPackage = mongoose.model('PublishPackage', PublishPackageSchema);
module.exports = PublishPackage;
