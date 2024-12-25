const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../../middleware/auth');
const profileService = require('../services/profileService');

router.get('/', isAuthenticated, profileController.getProfile);
router.post('/avatar', isAuthenticated, profileService.avatarUpload, profileController.postAvatar);

module.exports = router;