const orderService = require('../services/orderService')
const VNPayPayment = require('../../payment/service/vnpayPayment.service')
const VNPAYConfig = require('../../payment/config/vnpay.config')
exports.getOrders = async(req,res,next)=>{
    try{
        const user = res.locals.user.dataValues || res.locals.user
        const orders = await orderService.getOrdersByUserId(user.user_id);
        orders.forEach(order => {
            order.created_at = new Date(order.created_at).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        });
        res.render('order/order',{orders})
    }catch(e){
        next(e)
    }

}
exports.placeOrder = async (req, res, next) => {
    try {
        const user = res.locals.user.dataValues || res.locals.user

        const {cart,orderBody} = req.body
        if (!user.user_id || !cart || !orderBody) {
            return res.status(400).json({ message: "userId and cart are required!!" });
        }

        if (cart.items.length <= 0) {
            return res.status(400).json({ message: "Cart is empty, please add items before placing an order." });
        }

        if (!orderBody.shippingAddress || !orderBody.paymentMethod) {
            return res.status(400).json({ message: "Shipping address and payment method are required." });
        }
        
        const order = await orderService.createOrder(user.user_id,orderBody,cart);


        if (orderBody.paymentMethod === 'vnpay') {
            let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
                
            let returnUrl = `localhost:3000/order/update-status?order=${order.order_id}`

            const paymentUrl =  await orderService.paymentViaVNPay(order.order_id,ipAddr,returnUrl)


            return res.status(200).json({ paymentUrl: paymentUrl });
        }
        res.status(200).json({ message: "Place order successfully" });
    } catch (e) {

        console.error("Error while place order:", e);
        res.status(500).json({ message: "Error while place order, please try again!" });
    }
};

exports.updateOrderPaymentStatus = async(req,res,next)=>{
    try{
        let order_id = req.params.order_id

        if (!order_id || isNaN(order_id)) {
            return res.render('order/order')
        }

        await orderService.updateOrderPaymentStatus(order_id)
        return res.render('order/order')
    }catch(e)
    {
        next(e)
    }
}

exports.paymentViaVnpay = async(req,res,next)=>{
    try{
        const {order_id} = req.body

        let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
        let returnUrl = `localhost:3000/order/update-status?order_id=${order_id}`
        
        const paymentUrl =  await orderService.paymentViaVNPay(order_id,ipAddr,returnUrl)

        return res.status(200).json({ paymentUrl: paymentUrl });

    }catch(e){
        next(e)
    }
}

exports.getAllOrders = async(req,res,next)=>{
      try{
            const orders = await orderService.getAllOrders(req.query)
            return res.status(200).json(orders)
        }catch(err)
        {
            return next(new Error('Internal Server Error: Unable to retrieve orders'))
        }
}

exports.getOrderDetails = async(req,res,next)=>{

    try{

        const order = await orderService.getOrderDetails(req.params.id)
        if(order.success)
        {
            return res.status(200).json(order)
        }else{
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
            
    }catch(err)
    {
        return next(new Error('Internal Server Error: Unable to retrieve user details'))
    }
}
exports.updateOrderPaymentStatus = async(req,res,next)=>{
    try{

        const order = await orderService.updateOrderPaymentStatus(req.params.id,req.body.paymentStatus)
        if(order.success)
        {
            return res.status(200).json(order)
        }else{
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
            
    }catch(err)
    {
        return next(new Error('Internal Server Error: Unable to update order status'))
    }
}