const express = require('express');
const router = express.Router();
const orderController = require('../../order/controllers/orderController');
const authMiddleware = require('../../middleware/auth.js')
router.get('/',authMiddleware.isAuthenticated, orderController.getOrders);
router.post('/',authMiddleware.isAuthenticated,orderController.placeOrder)
module.exports = router;