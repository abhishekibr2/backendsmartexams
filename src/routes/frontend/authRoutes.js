const express = require('express');
const router = express.Router();
const authController = require('../../controllers/frontend/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-session', authController.checkSession);
router.post('/socialLogin', authController.socialLogin);
router.post('/forget-password', authController.forgotPassword);
router.post('/matchOtp', authController.matchOtp);
router.get('/resendOtp/:id', authController.resendOtp);
router.post('/setNewPassword', authController.setNewPassword);
router.post('/create-password', authController.createNewPassword);
router.post('/email-verification', authController.sendEmailVerification);
router.post('/verify-otp', authController.matchEmailOtp);
router.get('/getUserById/:id', authController.getUserById);
router.post('/captcha', authController.generateCaptcha);

module.exports = router;
