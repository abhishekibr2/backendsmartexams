const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    message: { type: String, default: null },
    attachment: { type: String, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }],
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    message: { type: String, default: null },
    attachment: { type: String, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }],
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    replies: [replySchema]
});

const forumSchema = new mongoose.Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    attachment: { type: String, default: null },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'forumCategory', default: null },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'forumSubcategory', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    comments: [commentSchema],
    slug: { type: String, unique: true, index: true, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }],
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
});

forumSchema.pre('save', async function (next) {
    if (this.title) {
        // Convert title to lowercase and replace spaces with hyphens
        let titleSlug = this.title.toLowerCase().replace(/\s+/g, '-');

        // Remove any characters that are not alphanumeric or hyphens
        titleSlug = titleSlug.replace(/[^a-z0-9-]/g, '');

        this.slug = titleSlug;
    }

    next();
});


const Forum = mongoose.model('forums', forumSchema);

module.exports = Forum;
