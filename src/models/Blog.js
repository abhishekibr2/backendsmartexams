const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
	title: { type: String, default: null },
	description: { type: String, default: null },
	image: { type: String, default: null },
	slug: { type: String, unique: true, index: true, default: null },
	categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'blogCategory', default: null },
	authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'author', default: null },
	imageAltText: { type: String, default: null },
	metaTitle: { type: String, default: null },
	metaDescription: { type: String, default: null },
	timeToRead: { type: String, default: null },
	status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	createdAt: { type: Date, index: true, default: Date.now },
	updatedAt: { type: Date, index: true, default: Date.now },
	deletedAt: { type: Date, index: true, default: Date.now }
});

const Blog = mongoose.model('blog', blogSchema);

module.exports = Blog;
