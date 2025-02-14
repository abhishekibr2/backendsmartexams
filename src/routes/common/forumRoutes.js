const express = require('express');
const router = express.Router();
const forumController = require('../../controllers/common/forumController');

router.post('/update-forum-data/', forumController.addUpdateForumData);
router.get('/get-all-forums/', forumController.getAllForums);
router.post('/delete-forum-attachment/', forumController.deleteForumAttachment);
router.post('/delete-forum/', forumController.deleteForum);
router.get('/get-forums-categories/', forumController.getForumCategories);

module.exports = router;
