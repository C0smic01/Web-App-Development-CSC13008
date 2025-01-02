const { Op } = require('sequelize'); 
const models = require('../../index');
const Order = models.Order
const AppError = require('../../utils/AppError')
const sequelize = require('../../config/database');
const Product = models.Product
const OrderDetail = models.OrderDetail
const revenueReport = async (timeRange, startDate, endDate) => {
    try {

        if (!['day', 'week', 'month'].includes(timeRange)) {
            throw new Error("Invalid time range. Use 'day', 'week', or 'month'.");
        }

        const format = {
            day: sequelize.literal("TO_CHAR(created_at, 'YYYY-MM-DD')"),
            week: sequelize.literal("TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD')"), 
            month: sequelize.literal("TO_CHAR(created_at, 'YYYY-MM')")
        };

        const revenues = await Order.findAll({
            attributes: [
                [format[timeRange], 'timePeriod'], 
                [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue']
            ],
            where: {
                created_at: {
                    [Op.between]: [startDate, endDate] 
                }
            },
            group: ['timePeriod'], 
            order: [[sequelize.col('timePeriod'), 'ASC']] 
        });

        return revenues;
    } catch (e) {
        console.error(e);
        throw new AppError('Error while getting revenue report', 500);
    }
};

const topRevenueProduct = async (timeRange, startDate, endDate) => {
    try {
        if (!['day', 'week', 'month'].includes(timeRange)) {
            throw new Error("Invalid time range. Use 'day', 'week', or 'month'.");
        }

        const format = {
            day: sequelize.literal("TO_CHAR(\"Orders\".created_at, 'YYYY-MM-DD')"),
            week: sequelize.literal("TO_CHAR(DATE_TRUNC('week', \"Orders\".created_at), 'YYYY-MM-DD')"),
            month: sequelize.literal("TO_CHAR(\"Orders\".created_at, 'YYYY-MM')")
          };

        const topProducts = await OrderDetail.findAll({
            attributes: [
                [format[timeRange], 'timePeriod'],
                'product_id',
                [sequelize.fn('SUM', sequelize.col('OrderDetails.total')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('OrderDetails.quantity')), 'totalQuantity']
            ],
            include: [
                {
                    model: Product, 
                    attributes: ['product_id', 'product_name', 'price']
                },
                {
                    model: Order, 
                    attributes: [],
                    as: 'Orders', 
                    where: {
                        created_at: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                }
            ],
            group: ['timePeriod', 'OrderDetails.product_id', 'Product.product_id', 'Product.product_name', 'Product.price'],
            order: [[sequelize.fn('SUM', sequelize.col('OrderDetails.total')), 'DESC']],
            limit: 10
        });

        return topProducts.map(item => ({
            timePeriod: item.get('timePeriod'),
            productId: item.get('product_id'),
            productName: item.Product?.product_name || null,
            productPrice: item.Product?.price || null,
            totalRevenue: item.get('totalRevenue'),
            totalQuantity: item.get('totalQuantity')
        }));
    } catch (e) {
        console.error(e);
        throw new AppError('Error while getting top revenue products', 500);
    }
};



module.exports = { revenueReport,topRevenueProduct };
