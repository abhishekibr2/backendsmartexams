const express = require('express');
const router = express.Router();

const ebooksController = require('../../controllers/student/ebooksController');

router.get('/', ebooksController.getEbooksForStudent)
router.get('/single/:id', ebooksController.singleEbook);
router.get('/getAllStatesForFilter', ebooksController.getAllStatesForFilter);
router.get('/getAllExamTypeForFilter', ebooksController.getAllExamTypeForFilter);
router.get('/getAllEBooks/:userId', ebooksController.getAllEBooks);

module.exports = router
