const express = require('express');
const router = express.Router();
const emailController = require("../../controllers/admin/emailController");

router.post('/addEmailPageContent', emailController.addUpdateEmailContent);
router.get('/getEmailPageContent', emailController.getEmailContent)

module.exports = router;
