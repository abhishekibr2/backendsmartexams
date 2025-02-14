const express = require('express');
const router = express.Router();
const testConductedByRoutes = require("../../controllers/admin/testFeedbackController");

router.post('/testFeedback', testConductedByRoutes.addFeedback);

module.exports = router;



