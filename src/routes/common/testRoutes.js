const express = require('express');
const router = express.Router();
const testController = require("../../controllers/common/testController");

router.get('/getAllTests', testController.getAllTests);
router.post('/getTestById', testController.getTestsById);
// router.get('/:id/questions', testController.testQuestions);

module.exports = router;



