const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const QueryHelper = require('../utils/QueryHelper');
const AppError = require('../utils/AppError');
const models = require('../models');
const Product = models.Product;
const Category = models.Category;


const getAllProducts = async (queryStr) => {
    try {
        const queryHelper = new QueryHelper(Product, queryStr);
        let products = await queryHelper.executeQuery();
        products = products.map(p => p.dataValues);
        return products;
    } catch (e) {
        console.error('Error fetching products:', e);
        throw new AppError('Cannot get all products, error: ' + e.message, 404);
    }
};

const getProductById = async(productId) => {
    try {
        let product = await Product.findByPk(productId, {
            include: [{
                model: Category,
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
};

const getRelatedProducts = async(currentProductId, queryStr = {}) => {
    try {
        const currentProduct = await Product.findByPk(currentProductId, {
            include: [{
                model: Category,
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
                where: {
                    category_id: categoryIds // Match at least one category
                }
            }],
            limit: queryStr.limit || 4,
            order: sequelize.random()
        });

        // If not enough related products, fetch additional random products
        if (relatedProducts.length < (queryStr.limit || 4)) {
            const additionalProducts = await Product.findAll({
                where: {
                    product_id: {
                        [Sequelize.Op.notIn]: [
                            currentProductId,
                            ...relatedProducts.map(p => p.product_id)
                        ]
                    }
                },
                limit: (queryStr.limit || 4) - relatedProducts.length,
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