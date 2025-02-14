const express = require('express');
const router = express.Router();
const testConductedByController = require('../../controllers/admin/testConductedByController');

router.get('/', testConductedByController.getAllTestConduct);
router.post('/addUpdateTestConductDetails', testConductedByController.addUpdateTestConductDetails);
router.post('/deleteTestConduct', testConductedByController.deleteTestConduct);
module.exports = router;
