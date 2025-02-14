const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/student/cartController');

router.get('/:userId', cartController.getStudentCartDetails);

module.exports = router
