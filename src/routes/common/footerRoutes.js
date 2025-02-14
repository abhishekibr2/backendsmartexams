const commonFooter = require('../../controllers/common/footerMenuController')
const express = require('express');
const router = express.Router();


router.get('/common', commonFooter.getFooterMenus);

module.exports = router;
