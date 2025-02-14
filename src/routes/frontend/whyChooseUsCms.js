const express = require('express');
const router = express.Router();
const whyChooseUsController = require('../../controllers/frontend/whyChooseUsCms');

router.get('/', whyChooseUsController.getSectionData);

module.exports = router;
