const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/common/notificationController');

router.get('/:id', notificationController.notification);
router.post('/mark-all-as-read', notificationController.updateAllReadStatus);
router.post('/delete-all-messages', notificationController.deleteAllMessages);
router.post('/delete-messages', notificationController.deleteMessage);

module.exports = router;
