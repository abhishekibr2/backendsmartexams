const express = require("express");
const {
    getAllQuestions,
    getQuestionById,
    createOrUpdateQuestion,
    deleteQuestion, archiveQuestion,
    duplicateQuestion,
    importExcel,
    usedIn,
    searchQuestion,
    exportQuestion,
    takeOwnership,
    takeBulkOwnership, updataQuestionTopic
} = require("../../controllers/admin/questionController");
const questionController = require("../../controllers/student/questionController");
const router = express.Router();

router.get('/', getAllQuestions);
router.post('/', createOrUpdateQuestion);
router.post('/import', importExcel);
router.get('/:id', getQuestionById);
router.get('/ownership/:id', takeOwnership);
router.post('/ownership/bulk', takeBulkOwnership);
router.delete('/:id', deleteQuestion);
router.patch('/:id/archive', archiveQuestion);
router.post('/:id/duplicate', duplicateQuestion);
router.get('/usedin/:questionId', usedIn)
router.get('/search/topic', searchQuestion)
router.get('/data/export', exportQuestion)
router.get('/list/group', questionController.questionsGroupByTopic)
router.post('/updateTopics', updataQuestionTopic)


module.exports = router
