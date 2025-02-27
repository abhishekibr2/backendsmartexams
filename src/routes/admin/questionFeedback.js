const express = require("express");
const router = express.Router();

const questionFeedbackController = require("../../controllers/admin/questionFeedbackController");

router.post("/question", questionFeedbackController.addFeedback);
router.get('/getAllQuestionReport', questionFeedbackController.getAllQuestionsReport);
router.post('/report-bugs', questionFeedbackController.getAllQuestionReportsBugs);

module.exports = router;
