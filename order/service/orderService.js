const AppError = require('../../utils/AppError');
const models = require('../../models');
const Order = models.Order;
const OrderDetail = models.OrderDetail
const User = models.User
const sequelize = models.sequelize
const Product = models.Product
exports.getAllOrders = async () => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    attributes: ['user_name', 'email'], // Lấy thông tin user
                },
                {
                    model: OrderDetail,
                    attributes: ['product_id', 'quantity', 'total'], // Lấy thông tin OrderDetail
                    include: [
                        {
                            model: Product,
                            attributes: ['product_name', 'price', 'img'], // Lấy thông tin sản phẩm từ Product
                        }
                    ]
                }
            ],
        });

        // Xử lý kết quả để trả về dữ liệu dạng JSON
        return orders.map(order => ({
            ...order.dataValues,
            User: order.User ? order.User.dataValues : null,
            OrderDetails: order.OrderDetails.map(detail => ({
                ...detail.dataValues,
                Product: detail.Product ? detail.Product.dataValues : null, // Lấy thông tin sản phẩm
            })),
        }));
    } catch (error) {
        console.error(error);
        throw new AppError('Error while getting orders', 404);
    }
};
exports.createOrder = async(userId,cart)=>{
    let transaction
    try{
        if(userId == null) throw new AppError("userId is missing",400) 
        const user = await User.findByPk(userId)
        if(user == null) throw new AppError("user not found",400)
        if(cart.items.length === 0) throw new AppError("Cart is empty",400)
        transaction = await sequelize.transaction()

        const order = await Order.create({
            user_id : userId,
            total: cart.totalPrice
        },{transaction})
        const orderDetails = cart.items.map(item=>{
            return OrderDetail.create({
                order_id: order.dataValues.order_id,
                product_id: item.cartItem.productId,
                quantity: item.cartItem.quantity,
                total: item.cartItem.price * item.cartItem.quantity,
            },{transaction})
        })
        await Promise.all(orderDetails)
        await transaction.commit()
    }catch(e)
    {
        if(transaction) await transaction.rollback()
        console.error(e);
        throw new AppError("Error while creating order",500)
    }
}

