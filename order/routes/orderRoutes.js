const express = require('express');
const router = express.Router();
const orderController = require('../../order/controllers/orderController');
const authMiddleware = require('../../middleware/auth.js')
const {getOrdersMiddleware} = require('../middleware/getOrders.js')
const RoleName = require('../../authentication/models/RoleName.js');

router.get('/',authMiddleware.isAuthenticated,getOrdersMiddleware, orderController.getOrders);
router.get('/all',authMiddleware.isAuthenticated,authMiddleware.authorize(RoleName.ADMIN,RoleName.MANAGER),orderController.getAllOrders)
router.get('/:id',authMiddleware.isAuthenticated,authMiddleware.authorize(RoleName.ADMIN,RoleName.MANAGER),orderController.getOrderDetails)

router.patch('/:id',authMiddleware.isAuthenticated,authMiddleware.authorize(RoleName.ADMIN,RoleName.MANAGER),orderController.updateOrderPaymentStatus)

router.post('/',authMiddleware.isAuthenticated,orderController.placeOrder)

router.get('/update-status/:order_id',authMiddleware.isAuthenticated,getOrdersMiddleware,orderController.updateOrderPaymentStatus)

router.post('/vnpay-payment',authMiddleware.isAuthenticated,orderController.paymentViaVnpay)
module.exports = router;