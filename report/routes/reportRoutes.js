const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../../middleware/auth')
const RoleName = require('../../authentication/models/RoleName')

router.get('/revenue-report',authMiddleware.isAuthenticated,authMiddleware.authorize(RoleName.ADMIN,RoleName.MANAGER),reportController.getRevenueReport)
router.get('/top-revenue-product',authMiddleware.isAuthenticated,authMiddleware.authorize(RoleName.ADMIN,RoleName.MANAGER),reportController.getTopRevenueProduct)

module.exports = router