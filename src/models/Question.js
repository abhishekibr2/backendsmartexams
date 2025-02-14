const mongoose = require('mongoose');
const slugify = require('slugify');

const questionSchema = new mongoose.Schema({
    comprehensionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comprehension',
        default: null
    },
    complexityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'complexity',
        default: null
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        default: null
    },
    gradeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'grade',
        default: null
    },
    examTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'examType',
        default: null
    },
    questionOptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionOption',
        default: null
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',
        default: null
    },
    questionText: {
        type: String,
        index: true,
        default: null
    },
    questionType: {
        type: String,
        enum: ['multipleResponse', 'multipleChoice', 'trueFalse', 'comprehension'],
        default: 'multipleChoice'
    },
    topic: {
        type: String,
        default: null
    },
    topicSlug: {
        type: String,
        default: null,
        index: true
    },
    subTopic: {
        type: String,
        default: null
    },
    subTopicSlug: {
        type: String,
        default: null,
        index: true
    },
    hasImage: {
        type: Boolean,
        default: false
    },
    qualityChecked: {
        type: Boolean,
        default: false
    },
    answerFeedback: {
        type: String,
        default: null
    },
    explanation: {
        type: String,
        default: null
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    ownership: {
        type: String,
        enum: ['superadmin', 'admin', 'operator'],
        default: 'admin'
    },
    createdBy: {
        type: String,
        enum: ['superadmin', 'admin', 'operator'],
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted', 'suspended', 'draft'],
        default: 'active'
    }
},
    {
        timestamps: true
    });

questionSchema.pre('save', function (next) {
    if (this.topic) {
        this.topicSlug = slugify(this.topic, { lower: true, strict: true });
    }
    if (this.subTopic) {
        this.subTopicSlug = slugify(this.subTopic, { lower: true, strict: true });
    }
    next();
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
