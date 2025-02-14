const express = require('express');
const router = express.Router();
const stateController = require('../../controllers/admin/stateController');

router.get('/', stateController.getAllStates);
router.post('/addUpdateStateDetail', stateController.addUpdateStateDetails);
router.post('/deleteState', stateController.deleteState);
module.exports = router;
