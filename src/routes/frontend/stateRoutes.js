const express = require('express');
const router = express.Router();
const stateController = require('../../controllers/frontend/stateController');

router.get('/', stateController.getAllStates);

module.exports = router;
