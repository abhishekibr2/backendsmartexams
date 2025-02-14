const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const blogRoutes = require('./blogRoutes');
const paymentRoutes = require('./paymentRoutes');
const menuRoutes = require('./menuRoutes');
const contactUsRoutes = require('./contactUsRoutes');
const forumRoutes = require('./forumRoutes');
const testimonialRoutes = require('./testimonialRoutes');
const serviceRoutes = require('./serviceRoutes');
const ebookRoutes = require('./ebookRoutes');
const stateRoutes = require('./stateRoutes');
const faqRoute = require('./faqRoute');
const homepageContentRoutes = require("./homepageContentRoutes");
const publishPackageRoutes = require('./publishPackageRoutes');
const cartRoutes = require('./cartRoutes');
const termsConditionRoutes = require('./termsConditionRoutes')
const privacyRoute = require('./privacy&policy')
const tutorialRoute = require('./tutorialClass')
const whyChooseUsRoute = require('./whyChooseUsCms')
const examTypesRoutes = require('./examTypesRoutes')


router.use('/auth', authRoutes);
router.use('/contactUs', contactUsRoutes);
router.use('/blogs', blogRoutes);
router.use('/payment', paymentRoutes);
router.use('/menus', menuRoutes);
router.use('/forums', forumRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/services', serviceRoutes);
router.use('/state', stateRoutes);
router.use('/examTypes', examTypesRoutes);
router.use('/ebook', ebookRoutes);
router.use('/faqData', faqRoute);
router.use('/homepageContent', homepageContentRoutes);
router.use('/get-all-test-packs', publishPackageRoutes);
router.use('/cart', cartRoutes);
router.use('/termsCondition', termsConditionRoutes)
router.use('/privacyRoute', privacyRoute)
router.use('/tutorialClass', tutorialRoute)
router.use('/whyChooseUs', whyChooseUsRoute)


module.exports = router;
