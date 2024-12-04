const orderService = require('../service/orderService')
exports.getOrders = async(req,res,next)=>{
    try{
        const orders = await orderService.getAllOrders();
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
        const {cart } = req.body;

        if (!user.user_id || !cart) {
            return res.status(400).json({ message: "userId and cart are required!!" });
        }
        await orderService.createOrder(user.user_id, cart);
        console.log(cart,user)

        res.status(200).json({ message: "Place order successfully" });
    } catch (e) {

        console.error("Error while place order:", e);
        res.status(500).json({ message: "Error while place order, please try again!" });
    }
};