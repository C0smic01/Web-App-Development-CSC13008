const reportService = require('../service/reportService')

exports.getRevenueReport = async (req, res) => {
    try {
        const { timeRange, startDate, endDate } = req.query;

        if (!timeRange || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: timeRange, startDate, endDate.'
            });
        }

        const report = await reportService.revenueReport(timeRange, startDate, endDate);

        res.status(200).json({
            success: true,
            message: 'Revenue report generated successfully.',
            data: report
        });
    } catch (error) {
        console.error('Get revenue report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating revenue report.'
        });
    }
};

