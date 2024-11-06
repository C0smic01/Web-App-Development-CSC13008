const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const Product = require('../models/Product')(sequelize, Sequelize.DataTypes);

const QueryHelper = require('../utils/QueryHelper')
const AppError = require('../utils/AppError')

const getAllProducts = async (queryStr) => {
    try {
        const queryHelper = new QueryHelper(Product, queryStr);
        let products = await queryHelper.executeQuery()
        products = products.map(p=>p.dataValues)
        return products
    } catch (e) {
        console.error('Error fetching products:', e);
        throw new AppError('Cannot get all products, error: ' + e.message, 404);
    }
};




// GET - Get product by id ../:id

const getProductById = async(productId)=>{
    try{
        let product = await Product.findByPk(productId)
        product = product.dataValues
        if(!product)
        {
            throw new AppError('Product not found',404) 
        }
        return product
    }catch(e)
    {
        throw new AppError('Cannot get product with id : '+productId,500)
    }
}
module.exports = {getAllProducts,getProductById}