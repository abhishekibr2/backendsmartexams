const express = require('express');
const router = express.Router();
const contactUsController = require('../../controllers/admin/contactUsController');

router.get('/', contactUsController.getContactUsController);
router.post('/deleteContactUs', contactUsController.deleteContactUs);
router.post('/submitContactUsMessage', contactUsController.submitContactUsMessage);
router.get('/getContactUsData/:createdBy', contactUsController.getContactUsData);

module.exports = router;
