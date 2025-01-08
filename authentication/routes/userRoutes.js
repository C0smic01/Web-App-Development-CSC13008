const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isNotAuthenticated, isAuthenticated, authorize } = require('../../middleware/auth');
const RoleName = require('../models/RoleName');
const Role = require('../models/Role');

router.get('/',isAuthenticated,authorize(RoleName.ADMIN,RoleName.MANAGER),userController.getAllUsers)
router.get('/:id',isAuthenticated,authorize(RoleName.ADMIN,RoleName.MANAGER),userController.getUserDetails)
router.patch('/:id/toggle-ban',isAuthenticated,authorize(RoleName.ADMIN,RoleName.MANAGER),userController.toggleBanUser)
router.patch('/update-profile',isAuthenticated,authorize(RoleName.ADMIN,RoleName.MANAGER),userController.updateProfile)

module.exports = router