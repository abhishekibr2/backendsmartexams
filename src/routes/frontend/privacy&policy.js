const express = require('express');
const router = express.Router();
const PrivacyController = require('../../controllers/frontend/privacy&policy')
router.get('/', PrivacyController.getPrivacyPolicy);

module.exports = router;
