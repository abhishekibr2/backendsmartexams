const express = require('express');
const frontendRoutes = require('./frontend');
const adminRoutes = require('./admin');
const commonRoutes = require('./common');
const userRoutes = require('./user');
const verifyToken = require('../middleware/verifyToken');
// const checkRole = require('../middleware/checkRole');
const checkCommonRole = require('../middleware/checkCommonRole');
const router = express.Router();
const studentRoutes = require('./students');

router.use('/api', frontendRoutes);
router.use('/api/admin', verifyToken, adminRoutes);
router.use('/api/user', verifyToken, checkCommonRole('user'), userRoutes);
router.use('/api/common', verifyToken, checkCommonRole('user', 'admin'), commonRoutes);
// here student portal api routes
router.use('/api/student', verifyToken, checkCommonRole('student'), studentRoutes);

module.exports = router;
