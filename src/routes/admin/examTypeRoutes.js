const express = require('express');
const router = express.Router();
const examTypeController = require('../../controllers/admin/examTypeController');

router.get('/', examTypeController.getAllExamType);
router.post('/addUpdateExamTypeDetails', examTypeController.addUpdateExamTypeDetails);
router.post('/deleteExamType', examTypeController.deleteExamType);
module.exports = router;
