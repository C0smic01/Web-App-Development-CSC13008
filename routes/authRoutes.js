const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated, isAuthenticated } = require('../middleware/auth');

router.get('/login', isNotAuthenticated, authController.getLogin);
router.post('/login', isNotAuthenticated, authController.postLogin);
router.get('/register', isNotAuthenticated, authController.getRegister);
router.post('/register', isNotAuthenticated, authController.postRegister);
router.get('/logout', isAuthenticated, authController.logout);
router.get('/status',authController.getAuthStatus)

module.exports = router;