const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../../config/database');
const QueryHelper = require('../../utils/QueryHelper');
const AppError = require('../../utils/AppError');
const models = require('../../index');
const Manufacturer = models.Manufacturer;


const getAllManufacturers = async(query)=> {
    try{
        const manufacturers = await Manufacturer.findAll();
        return manufacturers.map(m=>m.dataValues)
    }catch(e)
    {
        throw new AppError("Error while getting manufacturers",404)
    }
    
}



module.exports = { getAllManufacturers};
