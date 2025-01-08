const manufacturerService = require('../services/manufacturerService');

class ManufacturerController {
    async getManufacturers(req, res) {
        try {
            const manufacturers = await manufacturerService.getAllManufacturers(req.query);
            res.json(manufacturers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createManufacturer(req, res) {
        try {
            const { m_name } = req.body;
            if (!m_name) {
                return res.status(400).json({ error: 'Manufacturer name is required' });
            }

            const manufacturer = await manufacturerService.createManufacturer(m_name);
            res.status(201).json(manufacturer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateManufacturer(req, res) {
        try {
            const { manufacturerId } = req.params;
            const { m_name } = req.body;

            if (!m_name) {
                return res.status(400).json({ error: 'Manufacturer name is required' });
            }

            const manufacturer = await manufacturerService.updateManufacturer(manufacturerId, m_name);
            
            if (!manufacturer) {
                return res.status(404).json({ error: 'Manufacturer not found' });
            }

            res.json(manufacturer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteManufacturer(req, res) {
        try {
            const { manufacturerId } = req.params;
            const result = await manufacturerService.deleteManufacturer(manufacturerId);
            
            if (!result) {
                return res.status(404).json({ error: 'Manufacturer not found' });
            }

            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ManufacturerController();