const express = require('express');
const router = express.Router();
const blogRoutes = require('./blogRoutes');
const authorRoutes = require('./authorRoutes');
const settingRoutes = require('./settingRoutes');
const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const rolesRoutes = require('./roleRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const contactusRoutes = require('./contactusRoutes');
const testimonialRoutes = require('./testimonialRoutes');
// const serviceRoutes = require('./serviceRoutes')
const packageRoutes = require("./packageRoutes")
const stateRoutes = require('./stateRoutes')
const subjectRoutes = require('./subjectRoutes')
const gradeRoutes = require('./gradeRoutes')
const examTypeRoutes = require('./examTypeRoutes')
const complexityRoutes = require('./complexityRoutes')
const testConductedByRoutes = require('./testConductedByRoutes')
const packageEssayRoutes = require('./packageEssayRoutes')
const questionRoutes = require('./questionRoutes')
const feedbackRoutes = require("./feedbackRoutes");
const testRoutes = require("./testRoutes");
const packageFeedbackRoute = require("./packageFeedbackRoute");
const questionFeedbackRoute = require('./questionFeedback')
const eBookRoutes = require('./eBookRoutes')
const faqRoutes = require('./faqRoutes')
const allOrdersRoutes = require('./allOrdersRoutes')
const durationRoutes = require('./durationRoutes')
const homepageContentRoutes = require("./homePageContentRoutes");
const aboutpageContentRoutes = require("./aboutPageContentRoutes");
const emailContentRoutes = require("./emailContentRoutes");

const termsConditionRoutes = require('./termsConditionRoutes');
const packageType = require('./packageType');
const whyChooseUs = require('./whyChooseUsCms');
const tutorialClass = require('./tutorialClass');
const privacypolicy = require('./privacy&policy')

router.use('/blogs', blogRoutes);
router.use('/authors', authorRoutes);
router.use('/settings', settingRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/roles', rolesRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/contactus', contactusRoutes);
router.use('/testimonial', testimonialRoutes);
// router.use('/services', serviceRoutes);
router.use('/packages', packageRoutes);
router.use('/states', stateRoutes);
router.use('/subjects', subjectRoutes);
router.use('/grades', gradeRoutes);
router.use('/examtype', examTypeRoutes);
router.use('/complexity', complexityRoutes);
router.use('/testConducted', testConductedByRoutes);
router.use('/packageEssay', packageEssayRoutes);
router.use('/question', questionRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/test', testRoutes);
router.use('/packageFeedback', packageFeedbackRoute);
router.use('/questionFeedback', questionFeedbackRoute);
router.use('/eBook', eBookRoutes);
router.use('/faq', faqRoutes)
router.use('/all-orders', allOrdersRoutes)
router.use('/duration', durationRoutes)
router.use('/homepageContent', homepageContentRoutes);
router.use('/aboutpageContent', aboutpageContentRoutes);
router.use('/emailContent', emailContentRoutes);

router.use('/termsCondition', termsConditionRoutes)
router.use('/packageType', packageType)
router.use('/whyChooseUs', whyChooseUs)
router.use('/addClass', tutorialClass)
router.use('/privacyPolicy', privacypolicy)

module.exports = router;
