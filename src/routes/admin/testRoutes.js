const express = require('express');
const router = express.Router();
const testController = require("../../controllers/admin/testController");


router.post('/createTest', testController.createTest);
router.get('/getAllTests', testController.getAllTests);
router.post('/deleteTest', testController.deleteTest);
router.post('/getTestById', testController.getTestsById);
router.post('/assignQuestions', testController.assignQuestions);
router.post('/removeQuestion', testController.removeQuestion);
router.get('/:id/questions', testController.testQuestions);
router.post('/:id/reorder', testController.reorderQuestion)
router.post('/publish/:id', testController.updatePublishPackage);
router.post('/qualityChecked/:id', testController.updateQualityChecked);
router.post('/report-problem', testController.reportProblem)

module.exports = router;



