const mongoose = require('mongoose');
const { Schema } = mongoose;

const TestSchema = new Schema({
    testName: { type: String, required: true },
    testDisplayName: { type: String, required: true },
    packageName: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    durationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Duration', default: null },
    duration: {
        type: Number,
        default: 0
    },
    maxQuestions: { type: Number, required: true },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'grade',
        default: null
    },
    state: {
        type: Schema.Types.ObjectId,
        ref: 'state',
        required: true
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    }],
    comprehensions: [{
        type: Schema.Types.ObjectId,
        ref: 'Comprehension',
        required: true
    }],
    questionOrder: [{
        type: Schema.Types.ObjectId,
        refPath: 'orderModel'
    }],
    introduction: {
        type: String,
        default: null
    },
    createTestId: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        default: null
    },
    orderModel: {
        type: String,
        enum: ['Question', 'Comprehension'],
    },
    difficulty: {
        type: String,
        default: null
    },
    showCalculation: { type: String, enum: ['yes', 'no'], required: true },
    testDescription: { type: String },
    examType: {
        type: Schema.Types.ObjectId,
        ref: 'examType',
        required: true
    },
    testConductedBy: {
        type: Schema.Types.ObjectId,
        ref: 'testConductedBy',
        required: true
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    selectTimer: { type: String, enum: ['yes', 'no'], required: true },
    subjectInPackage: [{
        type: String,
    }],
    qualityChecked: {
        type: Boolean,
        required: true,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false,
        required: true
    },
    status: { type: String, enum: ['active', 'inactive', 'deleted'], default: 'active' },

}, { timestamps: true });

const Test = mongoose.model('Test', TestSchema);

module.exports = Test;
