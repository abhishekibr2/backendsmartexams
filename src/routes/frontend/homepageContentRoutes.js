const express = require('express');
const router = express.Router();
const HomepageContentController = require("../../controllers/frontend/HomepageContentController")

router.get('/getHomePageContent', HomepageContentController.getHomePageContent);

module.exports = router;
