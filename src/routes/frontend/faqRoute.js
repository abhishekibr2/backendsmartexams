const express = require('express');
const router = express.Router();
const faqController = require('../../controllers/frontend/faqController')

router.get('/Faqs', faqController.getFaqs);
router.get('/:stateId/:examId', faqController.getFaqStateWithExamTypes);


module.exports = router;
