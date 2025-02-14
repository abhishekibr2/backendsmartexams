const express = require('express');
const router = express.Router();
const examTypeController = require('../../controllers/common/examTypeController');

router.get('/', examTypeController.getAllExamType);

module.exports = router;
