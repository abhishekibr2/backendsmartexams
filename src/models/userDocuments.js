const mongoose = require('mongoose');

const userDocumentSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
	documents: [
		{
			imagePath: { type: String, default: null },
			type: { type: String, default: null },
			name: { type: String, default: null }
		}
	],
	digitalSignature: { type: String, default: null },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

const userDocument = mongoose.model('userDocuments', userDocumentSchema);

module.exports = userDocument;
