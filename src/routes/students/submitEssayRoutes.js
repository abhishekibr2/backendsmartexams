const express = require('express');
const router = express.Router();
const submitPackageEssayController = require('../../controllers/student/submitPackageEssayController');

router.post('/submitEssay/', submitPackageEssayController.submitPackageEssayDetails);

module.exports = router;
