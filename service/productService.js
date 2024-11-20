const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../config/database');
const QueryHelper = require('../utils/QueryHelper');
const AppError = require('../utils/AppError');
const models = require('../models');
const Product = models.Product;
const Category = models.Category;

const getProductById = async(productId) => {
    try {
        let product = await Product.findByPk(productId, {
            include: [{
                model: Category,
                as: 'categories',
                through: { attributes: [] }
            }]
        });
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        product = product.get({ plain: true });
        return product;
    } catch(e) {
        throw new AppError('Cannot get product with id : ' + productId, 500);
    }
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

        if (query.search) {
            const searchLower = query.search.toLowerCase(); 
        
            filterConditions[Op.or] = [
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('product_name')),
                    {
                        [Op.like]: `%${searchLower}%`
                    }
                ),
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('description')),
                    {
                        [Op.like]: `%${searchLower}%`
                    }
                )
            ];
        }

        if (query.manufacturer_id) {
            filterConditions['manufacturer_id'] = query.manufacturer_id; 
        }

        if (query.status_id) {
            filterConditions['status_id'] = query.status_id;
        }
        const limit = query.limit ? Math.min(parseInt(query.limit, 10), 15) : 15 
        const products = await Product.findAll({
            where: filterConditions, 
            limit: limit,
            include: [{
                model: Category,
                as: 'categories',
                required: false,
                through: { attributes: [] }

            }],
            subQuery: false
        });

        return products.map(p=>p.get({ plain: true }));
    } catch (error) {
        console.error(error);
        throw new Error('Error filtering products');
    }
}

const getRelatedProducts = async(currentProductId, queryStr = {}) => {
    try {
        const currentProduct = await Product.findByPk(currentProductId, {
            include: [{
                model: Category,
                as: 'categories',
                through: { attributes: [] }
            }]
        });

        if (!currentProduct) {
            throw new AppError('Current product not found', 404);
        }

        // Get category IDs of the current product
        const categoryIds = currentProduct.categories.map(cat => cat.category_id);

        // Find related products
        const relatedProducts = await Product.findAll({
            where: {
                product_id: {
                    [Sequelize.Op.ne]: currentProductId // Exclude current product
                }
            },
            include: [{
                model: Category,
                through: { attributes: [] },
                as: 'categories',
                where: {
                    category_id: categoryIds // Match at least one category
                }
            }],
            limit: queryStr.limit || 3,
            order: sequelize.random()
        });

        // If not enough related products, fetch additional random products
        if (relatedProducts.length < (queryStr.limit || 3)) {
            const additionalProducts = await Product.findAll({
                where: {
                    product_id: {
                        [Sequelize.Op.notIn]: [
                            currentProductId,
                            ...relatedProducts.map(p => p.product_id)
                        ]
                    }
                },
                limit: (queryStr.limit || 3) - relatedProducts.length,
                order: sequelize.random()
            });
            
            return [
                ...relatedProducts.map(p => p.get({ plain: true })),
                ...additionalProducts.map(p => p.get({ plain: true }))
            ];
        }

        return relatedProducts.map(p => p.get({ plain: true }));
    } catch(e) {
        console.error('Error fetching related products:', e);
        throw new AppError('Cannot get related products: ' + e.message, 500);
    }
};

module.exports = { getAllProducts, getProductById, getRelatedProducts };
