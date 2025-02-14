const express = require('express');
const router = express.Router();
const feedbackController = require("../../controllers/admin/testFeedbackController");

router.post('/addFeedback', feedbackController.addFeedback);

module.exports = router;

