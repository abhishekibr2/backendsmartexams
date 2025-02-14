const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/profileController');

router.post('/update-profile-details', profileController.updateProfileDetails);
router.put('/update-password/:id', profileController.updatePassword);
router.post('/upload-user-documents', profileController.uploadIdentityDocuments);
router.post('/get-user-documents', profileController.getUserDocuments);
router.post('/delete-user-documents', profileController.deleteUserDocument);
router.post('/upload-signature', profileController.uploadDigitalSignature);
router.post('/lastSeenUser/:id', profileController.lastSeenUser);

module.exports = router;
