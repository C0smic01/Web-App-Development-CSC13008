const AppError = require('../../utils/AppError');
const models = require('../../index');
const Manufacturer = models.Manufacturer;
const Product = models.Product;

class ManufacturerService {
    async getAllManufacturers(query) {
        try {
            const manufacturers = await Manufacturer.findAll();
            return manufacturers.map(m => m.dataValues);
        } catch(e) {
            throw new AppError("Error while getting manufacturers", 404);
        }  
    }

    async createManufacturer(manufacturerName) {
        try {
            const manufacturerData = {
                m_name: manufacturerName
            };
            const manufacturer = await Manufacturer.create(manufacturerData);
            return manufacturer.dataValues;
        } catch(error) {
            console.log(error);
            throw new Error("Error while creating manufacturer");
        }
    }

    async updateManufacturer(manufacturerId, manufacturerName) {
        try {
            const manufacturer = await Manufacturer.findByPk(manufacturerId);
            
            if (!manufacturer) {
                return null;
            }
            await manufacturer.update({
                m_name: manufacturerName
            });
            return manufacturer.dataValues;
        } catch(error) {
            throw new Error("Error while updating manufacturer");
        }
    }

    async deleteManufacturer(manufacturerId) {
        try {
            const manufacturer = await Manufacturer.findByPk(manufacturerId);
            
            if (!manufacturer) {
                return false;
            }
            
            await Product.update(
                { manufacturer_id: null },
                { where: { manufacturer_id: manufacturerId } }
            );
    
            await manufacturer.destroy();
            return true;
        } catch(error) {
            throw new Error("Error while deleting manufacturer");
        }
    }
}

module.exports = new ManufacturerService();