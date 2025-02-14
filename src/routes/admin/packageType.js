const express = require('express');
const router = express.Router();
const packageTypeController = require('../../controllers/admin/packageTypeContoller');

router.post('/addPackageType', packageTypeController.addPackageType);
router.get('/', packageTypeController.getPackageType);
router.post('/deletePackageType', packageTypeController.deletePackageTye);

module.exports = router;
