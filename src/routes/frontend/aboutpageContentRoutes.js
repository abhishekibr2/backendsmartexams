const express = require('express');
const router = express.Router();
const AboutpageContentController = require("../../controllers/frontend/AboutpageContentController")

router.get('/getAboutPageContent', AboutpageContentController.getAboutPageContent);

module.exports = router;
