const express = require('express');
const router = express.Router();
const complexityController = require('../../controllers/admin/complexityController');

router.get('/', complexityController.getAllComplexity);
router.post('/addUpdateComplexityDetails', complexityController.addUpdateComplexityDetails);
router.post('/deleteComplexity', complexityController.deleteComplexity);
module.exports = router;
