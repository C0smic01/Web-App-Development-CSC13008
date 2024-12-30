const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isNotAuthenticated, isAuthenticated } = require('../../middleware/auth');

router.get('/',userController.getAllUsers)

module.exports = router