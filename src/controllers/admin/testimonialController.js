const Testimonials = require('../../models/testimonial');
const errorLogger = require('../../../logger');
const { createUpload } = require('../../utils/multerConfig');
const path = require('path');
const fs = require('fs').promises;

const testimonialsController = {
	getAllTestimonials: async (req, res) => {
		try {
			const testimonials = await Testimonials.find({ status: { $in: ['active', 'inactive'] } })
				.populate('state', 'title')
				.populate('examType', 'examType')
				.sort({ _id: -1 });

			res.status(200).json({ status: true, data: testimonials });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	addUpdateTestimonialsDetails: async (req, res) => {
		try {
			const upload = createUpload('testimonials');
			upload.single('image')(req, res, async (err) => {
				if (err) {
					errorLogger('Error uploading file:', err);
					return res.status(500).json({ message: 'Error uploading file', status: false });
				}

				try {
					const testimonialsData = {
						image: req.file ? req.file.filename : req.body.image,
						name: req.body.name,
						designation: req.body.designation,
						description: req.body.description,
						pages: req.body.pages ? req.body.pages.split(',').map(page => page.trim()) : [],
						state: req.body.state,
						examType: req.body.examType,
						metaTitle: req.body.metaTitle,
						metaDescription: req.body.metaDescription,
						testimonialsId: req.body.testimonialsId,
						createdBy: req.body.userID
					};


					if (req.body.testimonialsId) {
						const existingTestimonials = await Testimonials.findById(req.body.testimonialsId);

						if (!existingTestimonials) {
							return res.status(404).json({ status: false, message: 'Testimonials not found' });
						}

						Object.assign(existingTestimonials, testimonialsData);
						existingTestimonials.updatedBy = req.body.userID;
						await existingTestimonials.save();

						res.status(200).json({ status: true, message: 'Testimonials updated successfully' });
					} else {
						const newTestimonials = new Testimonials(testimonialsData);
						await newTestimonials.save();

						res.status(200).json({ status: true, message: 'Testimonials added successfully' });
					}
				} catch (error) {
					errorLogger('Error processing Testimonials operation:', error);
					error;

					res.status(500).json({ status: false, message: 'Internal Server Error' });
				}
			});
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},


	deleteTestimonialsImage: async (req, res) => {
		try {
			const data = req.body;
			const testimonials = await Testimonials.findById(data.testimonialsId);
			if (!testimonials) {
				return res.status(404).json({ message: 'Testimonials not found', status: false });
			}
			const filePath = path.join(__dirname, '../../storage/testimonials', testimonials.image);
			await fs.unlink(filePath);
			testimonials.image = null;
			await testimonials.save();
			res.json({ message: 'Testimonials photo deleted successfully', status: true });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error', status: false });
		}
	},

	deleteTestimonials: async (req, res) => {
		try {
			const { data } = req.body;

			// Ensure data is an array of IDs
			if (!Array.isArray(data) || data.length === 0) {
				return res.status(400).json({ message: 'Invalid input data', status: false });
			}

			// Use deleteMany to delete multiple documents
			const deletedFeatures = await Testimonials.deleteMany({ _id: { $in: data } });

			if (deletedFeatures.deletedCount === 0) {
				return res.status(404).json({ message: 'Testimonials not found', status: false });
			}

			res.json({ message: 'Testimonials have been deleted successfully', status: true });
		} catch (error) {
			errorLogger(error);
			console.log(error, "error");
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},


};

module.exports = testimonialsController;
