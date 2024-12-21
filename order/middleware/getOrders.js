const orderService = require('../services/orderService')
const getOrdersMiddleware = async (req, res, next) => {
    try {
        const user = res.locals.user.dataValues || res.locals.user;
        const orders = await orderService.getOrdersByUserId(user.user_id);
        orders.forEach(order => {
            order.created_at = new Date(order.created_at).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        });

        res.locals.orders = orders;
        next();  
    } catch (e) {
        next(e);  
    }
}
module.exports = {getOrdersMiddleware}