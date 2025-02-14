const express = require('express');
const router = express.Router();
const gradeServices = require('../../controllers/common/gradeController');

router.get('/', gradeServices.getAllGrades);

module.exports = router;
