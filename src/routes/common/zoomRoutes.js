const express = require('express');
const router = express.Router();
const zoomController = require('../../controllers/common/zoomController');

router.route('/').post(zoomController.create);
router.route('/').get(zoomController.create);

module.exports = router;
