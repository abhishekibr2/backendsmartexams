const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');

router.get('/', userController.getAllUsers);
router.post('/change', userController.changeStatus)
router.get('/userActivities', userController.getAllActivity);
router.post('/addUpdateUser', userController.addUpdateUser);
router.post('/deleteUser', userController.deleteUser);
router.post('/sendEmail', userController.sendEmail);

module.exports = router;
