const express = require('express');
const router = express.Router();
const gradeController = require('../../controllers/admin/gradeController');

router.get('/', gradeController.getAllGrades);
router.post('/addUpdateGradeDetails', gradeController.addUpdateGradeDetails);
router.post('/deleteGrade', gradeController.deleteGrade);
module.exports = router;
