const { Op } = require('sequelize'); 
const models = require('../../index');
const Order = models.Order
const AppError = require('../../utils/AppError')
const sequelize = require('../../config/database');

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

module.exports = { revenueReport };
