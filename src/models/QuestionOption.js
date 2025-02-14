const mongoose = require('mongoose');

const questionOptionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    hasImage: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    });

const QuestionOption = mongoose.model('QuestionOption', questionOptionSchema);

module.exports = QuestionOption;
