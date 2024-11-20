const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../config/database');
const QueryHelper = require('../utils/QueryHelper');
const AppError = require('../utils/AppError');
const models = require('../models');
const Status = models.Status;


const getProductStatus = async(query)=> {
    try{
        const status = await Status.findAll({
            where:{
                "status_type":"PRODUCT"
            }
        });
        return status.map(m=>m.dataValues)
    }catch(e)
    {
        throw new AppError("Error while getting product status",404)
    }
    
}



module.exports = { getProductStatus};
