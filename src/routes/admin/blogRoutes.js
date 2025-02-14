const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/admin/blogController');

// Blogs routes
router.get('/', blogController.getAllBlogs);
router.post('/addUpdateBlogDetails/', blogController.addUpdateBlogDetails);
router.post('/deleteBlog', blogController.deleteBlog);
module.exports = router;
