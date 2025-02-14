const express = require('express');
const router = express.Router();
const notificationRoutes = require('./notificationRoutes');
const userRoutes = require('./userRoutes');
const profileRoutes = require('./profileRoutes');
const zoomRoutes = require('./zoomRoutes');
const forumRoutes = require('./forumRoutes');
const blogRoutes = require('./blogRoutes');
const commonHeaderMenu = require('./headerRoute')
const commonFooterMenu = require('./footerRoutes')
const commonServices = require('./stateRoutes')
const commonGrade = require('./gradeRoutes')
const commonExamTypes = require('./examTypeRoutes')
const ebookPayments = require('./ebookPaymentsRoutes')

const testRoutes = require("./testRoutes");
const subjectRoutes = require('./subjectRoutes')
const complexityRoutes = require('./complexityRoutes')
const packageRoutes = require('./packageRoutes')
const packageEssayRoutes = require('./packageEssayRoutes')
const submitEssay = require('./submitEssayRoutes')


router.use('/notification', notificationRoutes);
router.use('/user', userRoutes);
router.use('/profile', profileRoutes);
router.use('/zoom', zoomRoutes);
router.use('/forum', forumRoutes);
router.use('/blogs', blogRoutes);
router.use('/header', commonHeaderMenu);
router.use('/footer', commonFooterMenu);
router.use('/states', commonServices);
router.use('/grades', commonGrade);
router.use('/examTypes', commonExamTypes);
router.use('/getAllPayments', ebookPayments);
// here make common\
router.use('/complexity', complexityRoutes);
router.use('/subjects', subjectRoutes);
router.use('/test', testRoutes);
router.use('/package', packageRoutes);
router.use('/packageEssay', packageEssayRoutes);
router.use('/essay', submitEssay);

module.exports = router;
