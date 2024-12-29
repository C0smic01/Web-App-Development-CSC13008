const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const path = require('path');
const multer = require('multer');
const util = require('util');
const sequelize = require('../../config/database');
const QueryHelper = require('../../utils/QueryHelper');
const AppError = require('../../utils/AppError');
const models = require('../../index');
const Product = models.Product;
const Category = models.Category;
const ProductImages = models.ProductImages;
const Review = models.Review;

const getProductById = async(productId) => {
    try {
        let product = await Product.findByPk(productId, {
            include: [
                {
                    model: Category,
                    as: 'categories',
                    through: { attributes: [] },  
                },
                {
                    model: ProductImages,
                    as: 'additional_images',
                    attributes: ['image_path']
                }
                // {
                //     model: Review,
                //     as: 'reviews',
                //     attributes: ['user_id', 'reviews_msg', 'rating', 'createdAt'],  
                // }
            ],
            subQuery: false, 
        });
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        product = product.get({ plain: true });

        // const reviews = product.reviews;
        // const totalReviews = reviews.length;
        // const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        // const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
        
        // product.total_rating = totalReviews;
        // product.avg_rating = parseFloat(avgRating)
        
        return product;
    } catch(e) {
        console.error(e)
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
        const page = query.page ? parseInt(query.page, 9) : 1;
        const limit = query.limit ? Math.min(parseInt(query.limit, 9), 9) : 9
        const offset = (page - 1) * limit;

        const {count, rows: products} = await Product.findAndCountAll({
            where: filterConditions, 
            limit: limit,
            offset: offset,
            include: [{
                model: Category,
                as: 'categories',
                required: false,
                through: { attributes: [] }
                }
            ],
            subQuery: false
        });

        return {
            products: products.map(p => p.get({ plain: true })),
            currentPage: page,
            totalPage: Math.ceil(count / limit)
        };

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

        const categoryIds = currentProduct.categories.map(cat => cat.category_id);

        const relatedProducts = await Product.findAll({
            where: {
                product_id: {
                    [Sequelize.Op.ne]: currentProductId
                }
            },
            include: [{
                model: Category,
                through: { attributes: [] },
                as: 'categories',
                where: {
                    category_id: categoryIds 
                }
            }],
            limit: queryStr.limit || 3,
            order: sequelize.random()
        });

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

const getAllProductsJson = async () => {
    try {
        let products = await Product.findAll({
            include: [{
                model: Category,
                as: 'categories',
                through: { attributes: [] }
            }]
        });

        return products
    } catch (e) {
        console.error('Error fetching products:', e);
        throw new AppError('Cannot get all products, error: ' + e.message, 404);
    }
};


const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/img/uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Export multer middleware directly
const upload = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
    }
});

const validateProductData = (productData, files) => {
    const errors = [];

    if (!productData.name || typeof productData.name !== 'string' || productData.name.trim().length < 2) {
        errors.push('Invalid product name');
    }

    const price = parseFloat(productData.price);
    if (!price || isNaN(price) || price <= 0) {
        errors.push('Invalid price');
    }

    const stock = parseInt(productData.stock);
    if (isNaN(stock) || stock < 0) {
        errors.push('Invalid stock quantity');
    }

    if (!productData.status_id) {
        errors.push('Status is required');
    }

    if (!productData.manufacturer_id) {
        errors.push('Manufacturer is required');
    }

    if (!productData.categories || 
        (!Array.isArray(productData.categories) && typeof productData.categories !== 'string')) {
        errors.push('At least one category is required');
    }

    if (productData.description && (typeof productData.description !== 'string' || productData.description.trim().length < 10)) {
        errors.push('Description must be at least 10 characters long');
    }

    return errors;
};

const createProduct = async (productData, files) => {
    const t = await sequelize.transaction();
    
    try {
        // Validate input data
        const validationErrors = validateProductData(productData, files);
        if (validationErrors.length > 0) {
            throw new AppError(validationErrors.join(', '), 400);
        }

        const uploadedPaths = files.map(file => `/img/uploads/${file.filename}`);

        const product = await Product.create({
            product_name: productData.name.trim(),
            price: parseFloat(productData.price),
            description: productData.description ? productData.description.trim() : null,
            remaining: parseInt(productData.stock),
            status_id: parseInt(productData.status_id),
            manufacturer_id: productData.manufacturer_id ? parseInt(productData.manufacturer_id) : null,
            img: uploadedPaths[0]
        }, { transaction: t });

        if (productData.categories) {
            const categoryIds = Array.isArray(productData.categories) 
                ? productData.categories.map(id => parseInt(id))
                : productData.categories.split(',').map(id => parseInt(id.trim()));
            
            // Validate that all category IDs exist
            const validCategories = await Category.findAll({
                where: {
                    category_id: categoryIds
                }
            });

            if (validCategories.length !== categoryIds.length) {
                throw new AppError('One or more invalid category IDs', 400);
            }

            await product.setCategories(categoryIds, { transaction: t });
        }

        if (uploadedPaths.length > 1) {
            const additionalImages = uploadedPaths.slice(1).map(path => ({
                product_id: product.product_id,
                image_path: path
            }));
            
            await ProductImages.bulkCreate(additionalImages, { transaction: t });
        }

        await t.commit();
        return {
            success: true,
            data: product,
            message: 'Product created successfully'
        };
    } catch (error) {
        await t.rollback();
        throw new AppError(error.message || 'Error creating product', error.status || 500);
    }
};

const getAllProductCategories = async () => {
    try {
        return await sequelize.query(
            'SELECT product_id, category_id FROM product_category',
            {
                type: Sequelize.QueryTypes.SELECT
            }
        );
    } 
    catch (error) {
        console.error('Error:', error);
        throw new AppError('Error while getting product categories: ' + error.message, 404);
    }
};

const deleteProduct = async (productId) => {
    const t = await sequelize.transaction();
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        await product.destroy({ transaction: t });
        await t.commit();
        return {
            success: true,
            message: 'Product deleted successfully'
        };
    } catch (error) {
        await t.rollback();
        throw new AppError(error.message || 'Error deleting product', error.status || 500);
    }
};

const updateProduct = async (productId, productData, files) => {
    const t = await sequelize.transaction();
    
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        await product.update({
            product_name: productData.product_name,
            price: parseFloat(productData.price),
            remaining: parseInt(productData.remaining),
            status_id: parseInt(productData.status_id),
            manufacturer_id: productData.manufacturer_id ? parseInt(productData.manufacturer_id) : null,
            description: productData.description ? productData.description.trim() : product.description
        }, { transaction: t });

        if (productData.category) {
            const categoryId = parseInt(productData.category);
            await product.setCategories([categoryId], { transaction: t });
        }

        if (files && files.length > 0) {
            const uploadedPaths = files.map(file => `/img/uploads/${file.filename}`);
            
            const newPhotos = uploadedPaths.map(path => ({
                product_id: product.product_id,
                image_path: path
            }));
            
            await ProductImages.bulkCreate(newPhotos, { transaction: t });
        }

        await t.commit();
        return {
            success: true,
            data: product,
            message: 'Product updated successfully'
        };
    } catch (error) {
        await t.rollback();
        throw new AppError(error.message || 'Error updating product', error.status || 500);
    }
};

const deleteProductPhoto = async (productId, photoId) => {
    const t = await sequelize.transaction();
    try {
        const photo = await ProductImages.findOne({
            where: {
                product_id: productId,
                id: photoId
            }
        });

        if (!photo) {
            throw new AppError('Photo not found', 404);
        }

        await photo.destroy({ transaction: t });
        await t.commit();

        return {
            success: true,
            message: 'Photo deleted successfully'
        };
    } catch (error) {
        await t.rollback();
        throw new AppError(error.message || 'Error deleting photo', error.status || 500);
    }
};

module.exports = { getAllProducts, getProductById, getRelatedProducts, getAllProductsJson, getAllProductCategories, createProduct, upload, deleteProduct, updateProduct, deleteProductPhoto };
