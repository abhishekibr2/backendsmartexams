const Blog = require('../../models/Blog');
const BlogViewCount = require('../../models/BlogViewCount');
const errorLogger = require('../../../logger');
const User = require('../../models/Users');
const { createUpload } = require('../../utils/multerConfig');
const mongoose = require('mongoose');

const blogController = {
	getAllBlogs: async (req, res) => {
		try {
			const blogs = await Blog.find({ status: { $in: ['active', 'inactive'] } })
				.sort({ _id: -1 })
				.populate('authorId');

			let updatedBlogs = [];

			for (let blog of blogs) {
				const blogViewCount = await BlogViewCount.countDocuments({ blogId: blog._id });
				// Add view count to blog data
				const updatedBlogData = { ...blog.toObject(), blogViewCount };
				updatedBlogs.push(updatedBlogData);
			}

			res.status(200).json({ status: true, data: updatedBlogs });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	addUpdateBlogDetails: async (req, res) => {
		try {
			const upload = createUpload('blogs');
			upload.single('image')(req, res, async (err) => {
				if (err) {
					errorLogger('Error uploading file:', err);
					return res.status(500).json({ message: 'Error uploading file', status: false });
				}

				try {
					const blogData = {
						image: req.file ? req.file.filename : req.body.image,
						title: req.body.title,
						slug: req.body.slug,
						description: req.body.description,
						imageAltText: req.body.imageAltText,
						metaTitle: req.body.metaTitle,
						metaDescription: req.body.metaDescription,
						timeToRead: req.body.timeToRead,
						status: req.body.status,
						authorId: req.body.authorId
					};

					if (req.body.blogId) {
						const existingBlog = await Blog.findById(req.body.blogId);
						if (!existingBlog) {
							return res.status(404).json({ status: false, message: 'Blog not found' });
						}
						Object.assign(existingBlog, blogData);
						existingBlog.updatedBy = req.body.userID;
						await existingBlog.save();
						const user = await User.findOne({ role: 'user' });
						if (!user) {
							return res.status(404).json({ success: false, message: 'Admin user not found' });
						}

						res.status(200).json({ status: true, message: 'Blog updated successfully' });
					} else {
						const newBlog = new Blog(blogData);
						await newBlog.save();
						res.status(200).json({ status: true, message: 'Blog added successfully' });
					}
				} catch (error) {
					console.log('errorblog', error);
					errorLogger('Error processing Blog operation:', error);
					res.status(500).json({ status: false, message: 'Internal Server Error' });
				}
			});
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	deleteBlog: async (req, res) => {
		try {
			const ids = req.body.flat();
			const objectIdArray = ids.map((id) => new mongoose.Types.ObjectId(id));
			if (!objectIdArray) {
				return res.status(404).json({ message: 'Blog Data not found', status: false });
			}
			await Blog.deleteMany({ _id: { $in: objectIdArray } });
			res.status(200).json({
				success: true,
				message: 'Blog deleted successfully'
			});
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
};

module.exports = blogController;
