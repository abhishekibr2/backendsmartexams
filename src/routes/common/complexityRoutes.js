const express = require('express');
const router = express.Router();
const complexityController = require('../../controllers/common/complexityController');

router.get('/', complexityController.getAllComplexity);
module.exports = router;
