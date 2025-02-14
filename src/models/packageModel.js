
const mongoose = require('mongoose');
const { Schema } = mongoose;

const packageSchema = new Schema({
    packageName: {
        type: String,
        default: null,
        trim: true
    },

    packageDescription: {
        type: String,
        default: null
    },
    packagePrice: {
        type: String,
        default: null
    },
    compareAtPrice: {
        type: String,
        default: null
    },
    packageDiscount: {
        type: String,
        default: null
    },
    packageDiscountPrice: {
        type: String,
        default: null
    },
    packageImage: {
        type: String,
        default: null
    },
    packageColor: {
        type: String,
        default: null
    },
    tag: {
        type: String,
        default: null
    },
    adminComment: {
        type: String,
        default: '',
    },

    packageType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PackageType',
        default: null
    },

    discountApplied: {
        type: String,
        enum: ['yes', 'no'],
        default: null
    },
    packageDuration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Duration',
        default: null
    },

    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'state',
        default: null
    },
    grade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'grade',
        default: null
    },
    assignTest: [{
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Test'
        }
    }],
    tests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    }],
    examType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'examType',
        default: null
    },
    numSubjects: {
        type: String,
        default: null
    },
    subjectsInPackage: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
    }],
    testType: {
        type: String,
        enum: ['single', 'multiple'],
        default: null
    },
    qualityChecked: {
        type: Boolean,
        default: false
    },
    numTests: {
        type: Number,
        default: null
    },
    isFree: {
        type: String,
        enum: ['yes', 'no'],
        default: null
    },
    readyToPublish: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: String,
        enum: ['yes', 'no'],
        default: null
    },
    numUniqueSubjects: {
        type: Number,
        enum: [1, 2, 3],
        default: null
    },
    assignedTo: {
        type: String,
        enum: ['admin', 'teacher'],
        default: null
    },
    status: {
        type: String,
        enum: ['inUse', 'notInUse'],
        default: 'inUse',
    },
    testConductedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'testConductedBy',
        default: null
    },
    essayTypes: {
        type: Number,
        default: null,
    },

    hasEssay: {
        type: String,
        enum: ['yes', 'no'],
        default: null
    },
    hasPackage: {
        type: String,
        enum: ['yes', 'no'],
        default: null
    },
    features: [{
        featureName: {
            type: String,
            required: true
        },
        availability: {
            type: String,
            enum: ['available', 'unavailable'],
            default: 'unavailable'
        }
    }]
}, {
    timestamps: true,
});

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
