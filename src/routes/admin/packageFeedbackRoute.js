const express = require('express');
const router = express.Router();
const packageFeedbackController = require("../../controllers/admin/packageFeedbackController");

router.post('/package', packageFeedbackController.addFeedback);

module.exports = router;



