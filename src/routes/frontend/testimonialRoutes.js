const express = require('express');
const router = express.Router();
const testimonialController = require('../../controllers/frontend/testimonialController');

router.get('/', testimonialController.getAllTestimonials);
router.get('/:stateId/:examId', testimonialController.getTestimonialStateWithExamTypes);
router.get('/tutorialTestimonials', testimonialController.getTutorialTestimonials);
router.get('/whyChooseUsTestimonials', testimonialController.getWhyChooseUsTestimonials);

module.exports = router;
