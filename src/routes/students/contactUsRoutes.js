const express = require('express');
const router = express.Router();
const contactUsController = require('../../controllers/student/contactUsController');

router.post('/submitContactUsMessage', contactUsController.submitContactUsMessage);
router.get('/getContactUsData/:userId', contactUsController.getContactUsData);

module.exports = router
