const express = require('express');
const router = express.Router();
const allOrdersController = require('../../controllers/admin/allOrdersController');

router.get('/getAllEbookOrders', allOrdersController.getAllEbookOrders);
router.get('/getAllPackageOrders', allOrdersController.getAllPackageOrders);
router.get('/getAllPackagesForFilter', allOrdersController.getAllPackagesForFilter);
router.get('/getAllEbooksForFilter', allOrdersController.getAllEbookForFilter);

module.exports = router;
