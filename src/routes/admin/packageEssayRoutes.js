const express = require('express');
const router = express.Router();
const packageEssayController = require('../../controllers/admin/packageEssayController');

router.post('/getEssay', packageEssayController.getAllPackageEssay);
router.post('/addUpdatePackageEssayDetails', packageEssayController.addUpdatePackageEssayDetails);
router.post('/deletePackageEssay', packageEssayController.deletePackageEssay);
module.exports = router;
