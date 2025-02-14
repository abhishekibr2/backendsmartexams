const express = require('express');
const router = express.Router();
const authorController = require('../../controllers/admin/authorController');

router.get('/', authorController.allAuthors);
router.post('/addUpdateAuthorDetails/', authorController.addUpdateAuthorDetails);
router.post('/deleteAuthor', authorController.deleteAuthor);
router.get('/users', authorController.getAllUsers);

module.exports = router;
