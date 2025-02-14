const express = require("express");
const {
    getAllQuestions,
    getQuestionById,
    createOrUpdateQuestion,
    deleteQuestion, archiveQuestion,
    duplicateQuestion,
    importExcel,
    usedIn,
    searchQuestion
} = require("../../controllers/admin/questionController");
const router = express.Router();

router.get('/', getAllQuestions);
router.post('/', createOrUpdateQuestion);
router.post('/import', importExcel);
router.get('/:id', getQuestionById);
router.delete('/:id', deleteQuestion);
router.patch('/:id/archive', archiveQuestion);
router.post('/:id/duplicate', duplicateQuestion);
router.get('/usedin/:questionId', usedIn)
router.get('/search/topic', searchQuestion)




module.exports = router
