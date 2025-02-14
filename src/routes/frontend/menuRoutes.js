const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/frontend/menuController');

router.get('/header', menuController.getHeaderMenus);

module.exports = router;
