const express = require('express');
const router = express.Router();
const aboutPageController = require("../../controllers/admin/aboutPageController");

router.get('/getAboutPageContent', aboutPageController.getAboutPageContent)
router.post('/addFrontendAboutPageContent', aboutPageController.addFrontendAboutPageContent);

module.exports = router;
