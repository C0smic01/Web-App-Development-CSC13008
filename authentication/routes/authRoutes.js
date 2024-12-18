const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated, isAuthenticated } = require('../../middleware/auth');

router.get('/register', isNotAuthenticated, authController.getRegister);
router.post('/register', isNotAuthenticated, authController.postRegister);

router.get('/verify-email', isNotAuthenticated, authController.getVerifyEmail);

router.get('/login', isNotAuthenticated, authController.getLogin);
router.post('/login', isNotAuthenticated, authController.postLogin);

router.get('/logout', isAuthenticated, authController.logout);
router.get('/status',authController.getAuthStatus);

router.get('/forgot-password', isNotAuthenticated, authController.getForgotPassword);
router.post('/forgot-password', isNotAuthenticated, authController.postForgotPassword);

router.get('/reset-password', isNotAuthenticated, authController.getResetPassword);
router.post('/reset-password', isNotAuthenticated, authController.postResetPassword);

module.exports = router;