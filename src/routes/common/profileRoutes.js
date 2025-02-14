const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/common/profileController');

router.post('/store-payment-method', profileController.storeCardDetail);
router.post('/cards', profileController.getAllCard);
router.post('/delete-card', profileController.deleteCard);
router.put('/update-password/:id', profileController.updatePassword);

module.exports = router;
