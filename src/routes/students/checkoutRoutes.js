const express = require('express');
const router = express.Router();

const checkoutController = require('../../controllers/student/checkoutController');

router.get('/getStudentCheckoutDetails/:userId', checkoutController.getStudentCheckoutDetails);

module.exports = router
