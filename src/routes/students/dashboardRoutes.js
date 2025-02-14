const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/student/dashboardController');

router.get('/getUserDashboardData/:userId', dashboardController.getUserDashboardData);

module.exports = router
