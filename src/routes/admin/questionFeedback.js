const express = require("express");
const router = express.Router();

const questionFeedbackController = require("../../controllers/admin/questionFeedbackController");

router.post("/question", questionFeedbackController.addFeedback);
router.get('/getAllQuestionReport', questionFeedbackController.getAllQuestionsReport);

module.exports = router;
