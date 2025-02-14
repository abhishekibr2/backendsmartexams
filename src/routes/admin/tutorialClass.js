const express = require('express');
const router = express.Router();
const tutorialController = require('../../controllers/admin/tutorialClass');

router.post('/addTutorial', tutorialController.addTutorial);
router.get('/', tutorialController.getTutorial)

module.exports = router
