const Author = require('../../models/Author');
const Users = require('../../models/Users');
const logError = require('../../../logger');
const { createUploadWithWatermark } = require('../../utils/multerConfig');
const mongoose = require('mongoose');

const authorController = {
	allAuthors: async (req, res) => {
		try {
			const authors = await Author.find({ status: { $in: ['active', 'inactive'] } }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: authors });
		} catch (error) {
			logError(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	addUpdateAuthorDetails: async (req, res) => {
		try {
			let updatedData = null;
			const upload = createUploadWithWatermark('authors');
			upload.single('profileImage')(req, res, async (err) => {
				if (err) {
					logError('Error uploading file:', err);
					return res.status(500).json({ message: 'Error uploading file', status: false });
				}

				try {
					const authorData = {
						profileImage: req.file ? req.file.filename : req.body.profileImage,
						name: req.body.name,
						slug: req.body.slug,
						gender: req.body.gender,
						designation: req.body.designation,
						description: req.body.description,
						linkedin: req.body.linkedin,
						facebook: req.body.facebook,
						twitter: req.body.twitter,
						instagram: req.body.instagram,
						status: req.body.status,
						createdBy: req.body.userID
					};

					if (req.body.authorId) {
						const existingAuthor = await Author.findById(req.body.authorId);

						if (!existingAuthor) {
							return res.status(404).json({ status: false, message: 'Author not found' });
						}

						Object.assign(existingAuthor, authorData);
						existingAuthor.updatedBy = req.body.userID;
						updatedData = await existingAuthor.save();

						res.status(200).json({
							status: true,
							message: 'Author updated successfully',
							data: updatedData
						});
					} else {
						const newAuthor = new Author(authorData);
						updatedData = await newAuthor.save();

						res.status(200).json({ status: true, message: 'Author added successfully', data: updatedData });
					}
				} catch (error) {
					logError('Error processing Author operation:', error);
					res.status(500).json({ status: false, message: 'Internal Server Error' });
				}
			});
		} catch (error) {
			logError(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	deleteAuthor: async (req, res) => {
		try {
			const ids = req.body.flat();
			const objectIdArray = ids.map((id) => new mongoose.Types.ObjectId(id));
			if (!objectIdArray) {
				return res.status(404).json({ message: 'contact-us Data not found', status: false });
			}
			await Author.deleteMany({ _id: { $in: objectIdArray } });
			res.status(200).json({
				success: true,
				message: 'Author deleted successfully'
			});
		} catch (error) {
			logError(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	getAllUsers: async (req, res) => {
		try {
			const users = await Users.find({ role: 'user' }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: users });
		} catch (error) {
			logError(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	}
};

module.exports = authorController;
