const express = require('express');
const router = express.Router();
const ebooksRoutes = require('./ebooksRoutes');
const testRoutes = require('./testRoutes');
const questionRoutes = require('../admin/questionRoutes');
const testAttemptRoutes = require('./testAttemptRoutes');
const packageRoutes = require('./packageRoutes');
const cartRoutes = require('./cartRoutes');
const profileRoutes = require('./profileRoutes');
const submitEssay = require('./submitEssayRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const contactUsRoutes = require('./contactUsRoutes');

router.use('/ebooks', ebooksRoutes);
router.use('/package', packageRoutes);
router.use('/test', testRoutes);
router.use('/question', questionRoutes);
router.use('/testAttempt', testAttemptRoutes);
router.use('/cart', cartRoutes);
router.use('/profile', profileRoutes);
router.use('/essay', submitEssay);
router.use('/checkout', checkoutRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact-us', contactUsRoutes);


module.exports = router;
