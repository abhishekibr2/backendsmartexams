const express = require('express');
const router = express.Router();
const submitPackageEssayController = require('../../controllers/common/submitPackageEssayController');

router.get('/getSubmitPackageEssay/', submitPackageEssayController.getSubmitPackageEssay);
router.get('/getPackageEssayById/:essayId', submitPackageEssayController.getPackageEssayById);
router.put('/updatePackageEssay/:essayId', submitPackageEssayController.updatePackageEssay);

module.exports = router;
