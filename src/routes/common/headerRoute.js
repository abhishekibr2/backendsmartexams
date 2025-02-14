const commonHeader = require('../../controllers/common/headerMenuController')
const express = require('express');
const router = express.Router();


router.get('/common', commonHeader.getHeaderMenus);

module.exports = router;
