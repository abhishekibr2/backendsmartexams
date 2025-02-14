const express = require('express');
const router = express.Router();
const privacyPolicyController = require('../../controllers/admin/privacy&policy');

router.post('/addPrivacyPolicy', privacyPolicyController.addPrivacyPolicy);
router.get('/', privacyPolicyController.getPrivacyPolicy)

module.exports = router
