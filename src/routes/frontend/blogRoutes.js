const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/frontend/blogController');

//car routes
router.get('/single/:slug', blogController.singleBlog);
router.get('/', blogController.allBlogs);
router.post('/blogViews', blogController.blogViews);
router.get('/fetchViewsBlogData', blogController.fetchViewsBlogData);

module.exports = router;
