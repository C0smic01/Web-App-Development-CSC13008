const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/revenue-report',reportController.getRevenueReport)
router.get('/top-revenue-product',reportController.getTopRevenueProduct)

module.exports = router