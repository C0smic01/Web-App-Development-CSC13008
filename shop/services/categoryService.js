const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../../config/database');
const QueryHelper = require('../../utils/QueryHelper');
const AppError = require('../../utils/AppError');
const models = require('../../index');
const Category = models.Category;


const getAllCategories = async(query)=> {
    try{
    
        const queryBuilder = new QueryHelper(Category,query)
        const categories = await Category.findAll();
        return categories.map(c=>c.dataValues)
    }catch(e)
    {
        throw new AppError("Error while getting categories",404)
    }
    
}



module.exports = { getAllCategories};
