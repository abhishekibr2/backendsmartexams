const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');

router.get('/dashboardCounts', dashboardController.dashboardCounts);
router.post('/getUserCountByMonthYear/', dashboardController.getUserCountByMonthYear);

module.exports = router;
