const express = require('express');
const router = express.Router();
const testimonial = require('../../controllers/admin/testimonialController');

router.post('/addUpdateTestimonial/', testimonial.addUpdateTestimonialsDetails);
router.get('/getAllTestimonials/', testimonial.getAllTestimonials);
router.post('/deleteTestimonials/', testimonial.deleteTestimonials);

module.exports = router;
