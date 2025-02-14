const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/admin/invoiceController');

router.get('/', invoiceController.getReceipt);

module.exports = router;
