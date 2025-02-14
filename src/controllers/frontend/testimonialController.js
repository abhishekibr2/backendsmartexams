const Testimonials = require('../../models/testimonial');
const errorLogger = require('../../../logger');

const testimonialController = {
	getAllTestimonials: async (req, res) => {
		try {
			const testimonials = await Testimonials.find({ pages: 'Home' }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: testimonials });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getTestimonialStateWithExamTypes: async (req, res) => {

		// Destructure stateId and examId from the request parameters
		const { stateId, examId } = req.params;

		try {
			// If both stateId and examId are provided, fetch testimonials with the given filters
			if (stateId && examId) {
				const testimonials = await Testimonials.find({
					state: stateId,
					examType: examId,
					pages: { $ne: 'Home' } // Exclude testimonials with 'home' page
				});

				if (!testimonials || testimonials.length === 0) {
					return res.status(200).json({
						status: false,
						message: 'No testimonials found for the given state and exam type',
					});
				}
				return res.status(200).json({ status: true, data: testimonials });
			}

			// If stateId or examId are not provided, fetch home testimonials
			const homeTestimonials = await Testimonials.find({
				pages: 'Home', // Only get testimonials where pages is 'home'
			});

			if (!homeTestimonials || homeTestimonials.length === 0) {
				return res.status(200).json({
					status: false,
					message: 'No home testimonials found',
				});
			}
			return res.status(200).json({ status: true, data: homeTestimonials });

		} catch (error) {
			// Handle errors
			return res.status(500).json({
				status: false,
				message: 'Error fetching Testimonials',
				error: error.message,
			});
		}
	},


	getTutorialTestimonials: async (req, res) => {
		try {
			const testimonials = await Testimonials.find({ pages: 'Tutoring & Classes' }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: testimonials });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getWhyChooseUsTestimonials: async (req, res) => {
		try {
			const testimonials = await Testimonials.find({ pages: 'Why Choose Us' }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: testimonials });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
};

module.exports = testimonialController;
