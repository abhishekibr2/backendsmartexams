const express = require('express');
const router = express.Router();
const faqController = require("../../controllers/admin/faqController");

router.post("/addQuestion", faqController.AddQuestions);
router.get("/getFaqs", faqController.getFaqData);
router.post("/deleteFaq", faqController.deleteFaq);




module.exports = router;
