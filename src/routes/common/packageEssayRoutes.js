const express = require('express');
const router = express.Router();
const packageEssayController = require('../../controllers/common/packageEssayController');

router.get('/getEssay', packageEssayController.getAllPackageEssay);
module.exports = router;
