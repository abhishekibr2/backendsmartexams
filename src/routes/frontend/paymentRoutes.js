const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/frontend/paymentController');

router.get('/', paymentController.getAllPayments);
router.post('/get-client-secret', paymentController.getClientSecret);
router.post('/confirmProductCheckout', paymentController.confirmProductCheckout);
router.get('/getUserOrderDetails/:userId', paymentController.getUserOrderDetails);

module.exports = router;
