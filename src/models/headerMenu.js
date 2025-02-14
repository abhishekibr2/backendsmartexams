const mongoose = require('mongoose');

const capitalize = (str) => {
    if (typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const subMenuSchema = new mongoose.Schema({
    title: { type: String, default: null },
    link: { type: String, default: null },
});

const headerMenuSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    title: { type: String, default: null },
    link: { type: String, default: null },
    subMenu: [subMenuSchema],
    order: { type: Number, default: 1 }, // Add order field
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

headerMenuSchema.pre('save', async function (next) {
    const doc = this;
    if (doc.isNew) {
        try {
            // Find the maximum order number in existing items
            if (this.isModified('title')) {
                this.title = capitalize(this.title);
            }
            const maxOrder = await headerMenuModel.findOne().sort('-order').select('order').lean();
            doc.order = maxOrder ? maxOrder.order + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const headerMenuModel = mongoose.model('headerMenu', headerMenuSchema);

module.exports = headerMenuModel;
