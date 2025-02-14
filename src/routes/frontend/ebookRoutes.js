const express = require('express');
const router = express.Router();
const ebookController = require('../../controllers/frontend/ebookController');

router.get('/single/:slug', ebookController.singleEbook);
router.get('/', ebookController.allEbook);

module.exports = router;
