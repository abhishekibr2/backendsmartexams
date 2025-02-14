const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
    complexityId: { type: mongoose.Schema.Types.ObjectId, ref: 'complexity', default: null },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', default: null },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'state', default: null },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'grade', default: null },
    examTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'examType', default: null },
    title: { type: String, default: null },
    isFree: { type: String, default: null },
    slug: { type: String, default: null },
    description: { type: String, default: null },
    pdfFile: { type: String, required: false },
    image: { type: String, required: false },
    imageSize: { type: String, required: false },
    authorScore: { type: String, default: null },
    price: { type: String, default: null },
    discount: { type: String, default: null },
    discountedPrice: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    createdAt: { type: Date, index: true, default: Date.now },
    updatedAt: { type: Date, index: true, default: Date.now },
    deletedAt: { type: Date, index: true, default: Date.now }
});

const Ebook = mongoose.model('ebook', ebookSchema);

module.exports = Ebook;
