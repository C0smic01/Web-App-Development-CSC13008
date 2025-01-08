const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isNotAuthenticated, isAuthenticated, authorize } = require('../../middleware/auth');

router.get('/',authorize("ADMIN","MANAGER"),userController.getAllUsers)
router.get('/:id',authorize("ADMIN","MANAGER"),userController.getUserDetails)
router.patch('/:id/toggle-ban',authorize("ADMIN","MANAGER"),userController.toggleBanUser)

module.exports = router