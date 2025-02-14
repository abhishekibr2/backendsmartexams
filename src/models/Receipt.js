const mongoose = require('mongoose');

const receiptSchema = mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	brandId: { type: String, default: null },
	dueDate: { type: String, default: null },
	amount: { type: String, default: null },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});
const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
