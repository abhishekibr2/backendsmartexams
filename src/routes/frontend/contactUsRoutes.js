const express = require('express');
const router = express.Router();
const contactUsController = require('../../controllers/frontend/contactUsController');

router.post('/', contactUsController.submitContactUs);

module.exports = router;
