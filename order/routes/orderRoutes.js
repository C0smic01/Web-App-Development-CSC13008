const express = require('express');
const router = express.Router();
const orderController = require('../../order/controllers/orderController');
const authMiddleware = require('../../middleware/auth.js')
const {getOrdersMiddleware} = require('../middleware/getOrders.js')

router.get('/',authMiddleware.isAuthenticated,getOrdersMiddleware, orderController.getOrders);
router.get('/all',orderController.getAllOrders)
router.get('/:id',orderController.getOrderDetails)
router.post('/',authMiddleware.isAuthenticated,orderController.placeOrder)
router.get('/update-status/:order_id',authMiddleware.isAuthenticated,getOrdersMiddleware,orderController.updateOrderPaymentStatus)
router.post('/vnpay-payment',authMiddleware.isAuthenticated,orderController.paymentViaVnpay)
module.exports = router;