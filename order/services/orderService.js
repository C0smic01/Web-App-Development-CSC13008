const AppError = require('../../utils/AppError');
const models = require('../../index');
const User = models.User
const sequelize = models.sequelize
const Product = models.Product
const Order = models.Order
const OrderDetail = models.OrderDetail
const VNPayPayment = require('../../payment/service/vnpayPayment.service')
exports.getOrdersByUserId = async (user_id) => {
    try {
        if (!user_id) {
            throw new AppError("User ID is required", 400);
        }

        const orders = await Order.findAll({
            where: { user_id: user_id },
            order: [['created_at', 'DESC']],

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

exports.createOrder = async(userId,orderBody,cart)=>{
    let transaction
    try{
        if(userId == null) throw new AppError("userId is missing",400) 
        const user = await User.findByPk(userId)
        if(user == null) throw new AppError("user not found",400)
        if(cart.items.length === 0) throw new AppError("Cart is empty",400)
        transaction = await sequelize.transaction()

        const order = await Order.create({
            ...orderBody,
            user_id : userId,
            total: cart.totalPrice,
            paymentStatus: 'pending'

        },{transaction})
        const orderDetails = cart.items.map(async(item)=>{
            const product = await Product.findByPk(item.cartItem.productId)

            if (!product) {
                throw new AppError(`Product with id ${item.cartItem.productId} not found`, 400);
            }
            if (product.remaining < item.cartItem.quantity) {
                throw new AppError(`Not enough stock for product ${item.cartItem.productId}`, 400);
            }
            
            await product.update(
                { 
                    remaining: product.remaining - item.cartItem.quantity,
                    total_purchase: product.total_purchase + 1
                },
                { transaction }
            );
            return OrderDetail.create({
                order_id: order.dataValues.order_id,
                product_id: item.cartItem.productId,
                quantity: item.cartItem.quantity,
                total: item.cartItem.price * item.cartItem.quantity,
            },{transaction})
        })
        await Promise.all(orderDetails)
        await transaction.commit()
        return order.dataValues
    }catch(e)
    {
        if(transaction) await transaction.rollback()
        console.error(e);
        throw new AppError("Error while creating order",500)
    }
}

exports.updateOrderPaymentStatus = async (orderId)=>{
    try{

        if(orderId == null) throw new AppError('OrderId is missing',404)
        const order = await Order.findByPk(orderId)
        if(order == null) throw new AppError('Order not found',404)

        order.paymentStatus = 'paid'
        await order.save();


    }catch(e)
    {
        console.error(e)
        throw new AppError('Error while updating order',500)
    }
}

exports.paymentViaVNPay = async(order_id,ipAddr,returnUrl)=>{
    try{

        if(!order_id || !ipAddr || !returnUrl) throw new AppError('order_id , ipAddr, returnUrl is required')
        const order = await Order.findByPk(order_id)

        const vnPayPayment = new VNPayPayment({
            orderId : order_id, 
            amount : order.total, 
            orderInfo : `Order with id ${order_id} with total amount ${order.total}`,
            returnUrl: returnUrl,
            ipAddr : ipAddr,
            bankCode: ''
        });


        const paymentUrl = await vnPayPayment.createPaymentUrl();
        
        return paymentUrl ;

    }catch(e)
    {
        throw new AppError('Error while payment via VNPay',500)
    }
}

exports.getAllOrders = async(query)=>{
    try {
        const whereCondition = {}
        const {paymentStatus} = query 
        if(['pending','paid'].includes(paymentStatus))
        {
            whereCondition.paymentStatus = paymentStatus
        }
        const orders = await Order.findAll({
            where: whereCondition, 
            order: [['created_at', 'DESC']],

        });

        return orders.map(order => ({
            ...order.dataValues
        }));
    } catch (error) {
        console.error(error);
        throw new AppError('Error while getting orders', 404);
    }
}

exports.getOrderDetails = async(orderId)=>{
    try {

        const order = await Order.findByPk(orderId,{

            include: [
                {
                    model: User,
                    attributes: ['user_name', 'email'], 
                },
                {
                    model: OrderDetail,
                    attributes: ['product_id', 'quantity', 'total'], 
                    include: [
                        {
                            model: Product,
                            attributes: ['product_name', 'price', 'img'], 
                        }
                    ]
                }
            ],
        });

        if(order)
        {
            return {
                success: true,
                data: {
                    ...order.dataValues,
                    User: order.User ? order.User.dataValues : null,
                    OrderDetails: order.OrderDetails.map(detail => ({
                        ...detail.dataValues,
                        Product: detail.Product ? detail.Product.dataValues : null, 
                    })),
                }
            }
        }else
        {
            return {
                success: false,
                data: null
            }
        }

    } catch (error) {
        console.error(error);
        throw new AppError('Error while getting order details', 404);
    }
}

exports.updateOrderPaymentStatus = async(orderId,status)=>{
    try {

        const order = await Order.findByPk(orderId);

        if(order)
        {
            if(['pending','paid'].includes(status))
            {
                order.paymentStatus = status;
                await order.save();
                return {
                    success: true,
                    data: {
                        ...order.dataValues 
                        },
                    }
            }
        }
        else
        {
            return {
                success: false,
                data: null
            }
        }

    } catch (error) {
        console.error(error);
        throw new AppError('Error while getting order details', 404);
    }
}