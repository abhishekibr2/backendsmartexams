const express = require('express');
const router = express.Router();
const ebookPaymentsController = require('../../controllers/common/ebookPaymentsController');

router.get('/', ebookPaymentsController.getAllPayments);

module.exports = router;
