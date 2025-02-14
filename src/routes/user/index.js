const express = require('express');
const router = express.Router();
const profileRoutes = require('./profileRoutes');
const timerRoutes = require('./timerRoutes');
const ebooksRoutes = require('./ebooksRoutes.js');

router.use('/profile', profileRoutes);
router.use('/timer', timerRoutes);
router.use('/ebooks', ebooksRoutes);

module.exports = router;
