const express = require('express');
const router = express.Router();
const orderController = require('../../order/controller/orderController');
const authMiddleware = require('../../middleware/auth')
router.get('/',authMiddleware.isAuthenticated, orderController.getOrders);
router.post('/',authMiddleware.isAuthenticated,orderController.placeOrder)
module.exports = router;