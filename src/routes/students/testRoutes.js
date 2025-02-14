const express = require('express');
const router = express.Router();
const testController = require('../../controllers/student/testController');

router.get('/free', testController.freeTests);
router.get('/:id', testController.getTestsById);
router.post('/attempt', testController.attemptTest);

module.exports = router
