const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailPageContentSchema = new Schema({

    description: {
        type: String,
        required: false,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }


});

const EmailPageContent = mongoose.model('EmailPageContent', emailPageContentSchema);
module.exports = EmailPageContent;
