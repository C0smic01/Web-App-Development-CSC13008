const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isNotAuthenticated, isAuthenticated } = require('../../middleware/auth');

router.get('/',userController.getAllUsers)
router.get('/:id',userController.getUserDetails)
router.patch('/:id/toggle-ban',userController.toggleBanUser)

module.exports = router