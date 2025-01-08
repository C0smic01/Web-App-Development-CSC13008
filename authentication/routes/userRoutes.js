const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isNotAuthenticated, isAuthenticated, authorize } = require('../../middleware/auth');
const RoleName = require('../models/RoleName');
const Role = require('../models/Role');

router.get('/',authorize(RoleName.ADMIN,RoleName.MANAGER),userController.getAllUsers)
router.get('/:id',authorize(RoleName.ADMIN,RoleName.MANAGER),userController.getUserDetails)
router.patch('/:id/toggle-ban',authorize(RoleName.ADMIN,RoleName.MANAGER),userController.toggleBanUser)

module.exports = router