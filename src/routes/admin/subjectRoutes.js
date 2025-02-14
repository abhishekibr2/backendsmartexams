const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/admin/subjectController');

router.get('/', subjectController.getAllSubjects);
router.post('/addUpdateSubjectDetails', subjectController.addUpdateSubjectDetails);
router.post('/deleteSubject', subjectController.deleteSubject);
module.exports = router;
