const express = require('express');
const router = express.Router();
const examTypeController = require('../../controllers/frontend/examTypeController');

router.get('/', examTypeController.getAllExamType);

module.exports = router;
