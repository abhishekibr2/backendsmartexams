const express = require('express');
const router = express.Router();
const termsConditionController = require('../../controllers/admin/termsConditionController')

router.post('/addUpdate', termsConditionController.addUpdate);
router.get('/', termsConditionController.getTermsCondition);

module.exports = router;
