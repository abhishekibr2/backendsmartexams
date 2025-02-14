const express = require('express');
const router = express.Router();
const ebooksController = require('../../controllers/user/ebooksController')

router.get('/', ebooksController.allEbook)

module.exports = router
