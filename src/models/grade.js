const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
	gradeLevel: { 
        type: String, 
        default: null
    },
    status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    updatedAt: { type: Date, default: Date.now },
});

const Grade = mongoose.model('grade', gradeSchema);

module.exports = Grade;
