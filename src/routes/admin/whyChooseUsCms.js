const express = require('express');
const router = express.Router();
const whyChooseUsController = require('../../controllers/admin/whyChooseUsCms');

router.post('/addSectionOne', whyChooseUsController.addSectionOne);
router.get('/getSectionData', whyChooseUsController.getSectionData);

module.exports = router;
