const mongoose = require('mongoose');

const forumCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});


const ForumCategory = mongoose.model('forumCategory', forumCategorySchema);

module.exports = ForumCategory;
