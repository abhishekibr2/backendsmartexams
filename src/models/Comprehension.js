const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require('slugify');

const ComprehensionSchema = new Schema(
    {
        paragraph: {
            type: String,
            required: true,
        },
        topic: {
            type: String,
            required: true,
        },
        topicSlug: {
            type: String,
            default: null,
            index: true
        },
        subTopic: {
            type: String,
            required: true,
        },
        subTopicSlug: {
            type: String,
            default: null,
            index: true
        },
        subjectId: {
            type: Schema.Types.ObjectId,
            ref: 'subject',
            required: true,
        },
        gradeId: {
            type: Schema.Types.ObjectId,
            ref: 'grade',
            required: true,
        },
        examTypeId: {
            type: Schema.Types.ObjectId,
            ref: 'examType',
            required: true,
        },
        complexityId: {
            type: Schema.Types.ObjectId,
            ref: 'complexity',
            required: true,
        },
        questionId: [{
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        }],
        status: {
            type: String,
            enum: ['active', 'inactive', 'deleted'],
            default: 'active',
        },
        hasImage: {
            type: Boolean,
            default: false,
        },
        qualityChecked: {
            type: Boolean,
            default: false,
        },
        totalQuestions: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true
    }
);

ComprehensionSchema.pre('save', function (next) {
    if (this.topic) {
        this.topicSlug = slugify(this.topic, { lower: true, strict: true });
    }
    if (this.subTopic) {
        this.subTopicSlug = slugify(this.subTopic, { lower: true, strict: true });
    }
    next();
});

ComprehensionSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();

    if (update.topic) {
        update.topicSlug = slugify(update.topic, { lower: true, strict: true });
    }
    if (update.subTopic) {
        update.subTopicSlug = slugify(update.subTopic, { lower: true, strict: true });
    }

    this.setUpdate(update);
    next();
});

const Comprehension = mongoose.model("Comprehension", ComprehensionSchema);

module.exports = Comprehension;
