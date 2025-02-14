const express = require('express');
const router = express.Router();
const timerController = require('../../controllers/user/timerController');


router.post('/update-timer', timerController.updateTimer);
router.post('/get-timer', timerController.getTimer);


module.exports = router;
