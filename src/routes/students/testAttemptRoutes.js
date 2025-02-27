const express = require("express");
const testAttemptController = require("../../controllers/student/testAttemptController");
const router = express.Router();

router.get('/:id', testAttemptController.testAttempt);
router.get('/testAttempt/:id', testAttemptController.testAttempt);
router.get('/:id/all', testAttemptController.allQuestionAttempts);
router.get('/questionAttempt/goto', testAttemptController.goToQuestionAttempt);
router.post('/answer', testAttemptController.answerQuestion);
router.post('/questionAttempt/create', testAttemptController.createQuestionAttempt);
router.get('/complete/:id', testAttemptController.completeTest)
router.get('/test/result', testAttemptController.testResult);
router.post('/submit-feedback', testAttemptController.submitFeedback);

module.exports = router
