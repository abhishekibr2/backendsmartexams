const express = require('express');
const router = express.Router();
const packageEssayController = require('../../controllers/common/packageEssayController');

router.post('/getEssay', packageEssayController.getAllPackageEssay);
module.exports = router;
