const express = require('express');
const router = express.Router();
const tutorialController = require('../../controllers/frontend/tutorialClass');
router.get('/', tutorialController.getTutorial)

module.exports = router
