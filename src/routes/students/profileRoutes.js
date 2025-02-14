const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/student/profileController');

router.post('/update-profile-details/', profileController.updateProfileDetails);
router.put('/update-password/:id', profileController.updatePassword);

module.exports = router;
