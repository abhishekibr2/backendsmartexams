const express = require('express');
const router = express.Router();
const termsConditionController = require('../../controllers/frontend/termsConditionController')

router.get('/', termsConditionController.getTermsCondition);

module.exports = router;
