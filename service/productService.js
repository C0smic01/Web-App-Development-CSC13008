const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const {Category,Product} = require('../models/index.js')

const QueryHelper = require('../utils/QueryHelper')
const AppError = require('../utils/AppError')





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

const getProductByNameAndDescription = async(searchTerm)=>{
    const products = await Product.findAll({
        where:{
            name:{
                [Sequelize.Op.or]:[
                    {
                        name: {
                            [Sequelize.Op.like] : `%${searchTerm}%`
                        }
                    },
                    {
                        description: {
                            [Sequelize.Op.like] : `%${searchTerm}%`
                        }
                    }
                ]
            }
        }
    })
    return products.map(p=>p.dataValues)
}

const getAllProducts= async(query)=> {
    try {
        const filterConditions = {};

        if (query.category_id) {
            filterConditions['$categories.category_id$'] = query.category_id; 
        }

        if (query.price) {
            const priceConditions = {};
            if (query.price.gte) {
                priceConditions[Op.gte] = Number(query.price.gte)
            }
            if (query.price.lte) {
                priceConditions[Op.lte] = Number(query.price.lte)
            }

            if (priceConditions[Op.gte] || priceConditions[Op.lte]) {
                filterConditions['price'] = priceConditions;
            }
        }

        if (query.manufacturer_id) {
            filterConditions['manufacturer_id'] = query.manufacturer_id; 
        }

        if (query.status_id) {
            filterConditions['status_id'] = query.status_id;
        }
        const products = await Product.findAll({
            where: filterConditions, 
            include: [{
                model: Category,
                as: 'categories',
                required: false
            }]
        });

        return products;
    } catch (error) {
        console.error(error);
        throw new Error('Error filtering products');
    }
}
module.exports = {getAllProducts,getProductById,getProductByNameAndDescription}