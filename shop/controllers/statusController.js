const statusService = require('../services/statusService');

class statusController {
    async getStatuses(req, res) {
        try {
            const statuses = await statusService.getProductStatus();
            res.json(statuses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new statusController();