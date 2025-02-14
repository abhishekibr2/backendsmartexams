const express = require('express');
const router = express.Router();
const commonServices = require('../../controllers/common/stateController'); // Import the service controller from the appropriate file

// Service routes
router.get('/', commonServices.getAllState);
router.post('/common/addUpdateStateDetails/', commonServices.addUpdateStateDetails);
router.post('/common/deleteState', commonServices.deleteState);
module.exports = router;
