const orderService = require('../services/orderService')
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
        console.log(orders)
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
        console.log("Placing order with details:", cart, user, orderBody);
        
        await orderService.createOrder(user.user_id,orderBody,cart);

        res.status(200).json({ message: "Place order successfully" });
    } catch (e) {

        console.error("Error while place order:", e);
        res.status(500).json({ message: "Error while place order, please try again!" });
    }
};