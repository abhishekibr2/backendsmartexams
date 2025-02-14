const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/common/subjectController');

router.get('/', subjectController.getAllSubjects);
module.exports = router;
