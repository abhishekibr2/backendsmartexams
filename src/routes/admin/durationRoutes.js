const express = require('express');
const router = express.Router();
const durationController = require("../../controllers/admin/durationController");

router.post('/addDuration', durationController.addDuration);
router.get('/getDuration', durationController.getDuration);
router.post('/deleteDuration', durationController.deleteDuration);



module.exports = router
