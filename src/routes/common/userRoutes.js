const express = require('express');
const router = express.Router();
const userController = require('../../controllers/common/userController');

router.route('/').get(userController.allUsers);
router.get('/allUsers', userController.getAllUsers);
router.get('/allRoles', userController.allRoles);

module.exports = router;
