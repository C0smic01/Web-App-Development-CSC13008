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
                    attributes: ['image_id', 'image_path']
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
        const baseUrl = 'http://localhost:3000';
        product.photos = [
            ...(product.img ? [{
                id: 'main',
                url: `${baseUrl}${product.img}`
            }] : []),
            // Transform additional images
            ...(product.additional_images || []).map(img => ({
                id: img.image_id,
                url: `${baseUrl}${img.image_path}`
            }))
        ];

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

        let order = [['created_at', 'DESC']]; 

        if (query.sortBy) {
            const sortField = query.sortBy === 'price' ? 'price' : 'created_at';
            const sortOrder = query.sortOrder === 'desc' ? 'DESC' : 'ASC';
            order = [[sortField, sortOrder]]; 
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
            }],
            order:order,
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

const getAllProductsJson = async (query) => {
    if (!query) {
        query = {};
    }

    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = {};
        
        if (query.search) {
            whereClause[Op.or] = [
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('Product.product_name')),
                    {
                        [Op.like]: '%' + query.search.toLowerCase() + '%'
                    }
                )
            ];
        }

        if (query.manufacturer) {
            whereClause.manufacturer_id = query.manufacturer;
        }

        let order = [['created_at', 'DESC']];
        if (query.sortField) {
            const sortDir = query.sortDir && query.sortDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            switch (query.sortField) {
                case 'price':
                    order = [['price', sortDir]];
                    break;
                case 'total_purchase':
                    order = [['total_purchase', sortDir]];
                    break;
                case 'created_at':
                    order = [['created_at', sortDir]];
                    break;
                default:
                    order = [['created_at', 'DESC']];
            }
        }

        const categoryInclude = {
            model: Category,
            as: 'categories',
            through: { attributes: [] }
        };

        if (query.category) {
            categoryInclude.where = {
                category_name: query.category
            };
        }

        const totalCount = await Product.count({
            where: whereClause,
            include: [categoryInclude],
            distinct: true
        });

        const products = await Product.findAll({
            where: whereClause,
            include: [
                categoryInclude,
                {
                    model: models.Status,
                    as: 'Status',
                    attributes: ['status_name']
                },
                {
                    model: models.Manufacturer,
                    as: 'Manufacturer',
                    attributes: ['m_name']
                }
            ],
            order: order,
            limit: limit,
            offset: offset,
            distinct: true
        });

        const transformedProducts = products.map(function(product) {
            const plainProduct = product.get({ plain: true });
            const transformed = Object.assign({}, plainProduct);
            transformed.status_name = plainProduct.Status ? plainProduct.Status.status_name : null;
            transformed.manufacturer_name = plainProduct.Manufacturer ? plainProduct.Manufacturer.m_name : null;
            return transformed;
        });

        return {
            products: transformedProducts,
            total: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        };

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

const validateUpdateData = (productData, files) => {
    const errors = [];

    if (productData.product_name) {
        if (typeof productData.product_name !== 'string' || productData.product_name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters');
        }
    }

    if (productData.price) {
        const price = parseFloat(productData.price);
        if (isNaN(price) || price <= 0) {
            errors.push('Price must be a positive number');
        }
    }

    if (productData.remaining) {
        const stock = parseInt(productData.remaining);
        if (isNaN(stock) || stock < 0) {
            errors.push('Stock must be a non-negative number');
        }
    }

    if (productData.status_id) {
        const statusId = parseInt(productData.status_id);
        if (isNaN(statusId)) {
            errors.push('Invalid status');
        }
    }

    if (productData.manufacturer_id) {
        const manufacturerId = parseInt(productData.manufacturer_id);
        if (isNaN(manufacturerId)) {
            errors.push('Invalid manufacturer');
        }
    }

    if (productData.category_id) {
        const categoryId = parseInt(productData.category_id);
        if (isNaN(categoryId)) {
            errors.push('Invalid category');
        }
    }

    if (files && files.length > 0) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        files.forEach(file => {
            if (file.size > maxSize) {
                errors.push(`File ${file.originalname} exceeds 5MB size limit`);
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
                errors.push(`File ${file.originalname} is not a valid image type`);
            }
        });
    }

    return errors;
};

const updateProduct = async (productId, productData, files) => {
    const t = await sequelize.transaction();
    
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        // Validate input data
        const validationErrors = validateUpdateData(productData, files);
        if (validationErrors.length > 0) {
            throw new AppError(validationErrors.join(', '), 400);
        }

        // Update main product data
        await product.update({
            product_name: productData.product_name,
            price: parseFloat(productData.price),
            remaining: parseInt(productData.remaining),
            status_id: parseInt(productData.status_id),
            manufacturer_id: productData.manufacturer_id ? parseInt(productData.manufacturer_id) : null
        }, { transaction: t });

        // Handle category update
        if (productData.category_id) {
            // Verify category exists
            const categoryExists = await Category.findByPk(parseInt(productData.category_id));
            if (!categoryExists) {
                throw new AppError('Category not found', 404);
            }

            await sequelize.query(
                'DELETE FROM product_category WHERE product_id = ?',
                {
                    replacements: [productId],
                    type: Sequelize.QueryTypes.DELETE,
                    transaction: t
                }
            );

            await sequelize.query(
                'INSERT INTO product_category (product_id, category_id) VALUES (?, ?)',
                {
                    replacements: [productId, parseInt(productData.category_id)],
                    type: Sequelize.QueryTypes.INSERT,
                    transaction: t
                }
            );
        }

        // Handle new photos
        if (files && files.length > 0) {
            const uploadedPaths = files.map(file => `/img/uploads/${file.filename}`);
            
            // If product has no main image, use the first uploaded image as thumbnail
            if (!product.img) {
                await product.update({
                    img: uploadedPaths[0]
                }, { transaction: t });
                
                // Remove the first image from the array as it's now the thumbnail
                uploadedPaths.shift();
            }
            
            if (uploadedPaths.length > 0) {
                const newPhotos = uploadedPaths.map(path => ({
                    product_id: product.product_id,
                    image_path: path
                }));
                
                await ProductImages.bulkCreate(newPhotos, { transaction: t });
            }
        }

        await t.commit();

        const updatedProduct = await Product.findByPk(productId, {
            include: [{
                model: Category,
                as: 'categories',
                through: { attributes: [] }
            }]
        });

        return {
            success: true,
            data: updatedProduct,
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
                image_id: photoId
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

const deleteMainPhoto = async (productId) => {
    const t = await sequelize.transaction();
    try {
        // Find product with its additional images
        const product = await Product.findByPk(productId, {
            include: [{
                model: ProductImages,
                as: 'additional_images'
            }]
        });
        
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        if (!product.img) {
            throw new AppError('No main photo exists', 404);
        }

        // Check if there are any additional images
        if (product.additional_images && product.additional_images.length > 0) {
            // Get the first additional image
            const firstAdditionalImage = product.additional_images[0];
            
            // Set it as the main image
            await product.update({
                img: firstAdditionalImage.image_path
            }, { transaction: t });
            
            // Delete it from additional_images
            await firstAdditionalImage.destroy({ transaction: t });
        } else {
            // If no additional images, just set main image to null
            await product.update({img: null}, { transaction: t });
        }

        await t.commit();

        return {
            success: true,
            message: 'Main photo deleted successfully',
            newMainPhoto: product.additional_images && product.additional_images.length > 0 
                ? product.additional_images[0].image_path 
                : null
        };
    } catch (error) {
        await t.rollback();
        throw new AppError(error.message || 'Error deleting main photo', error.status || 500);
    }
};

module.exports = { getAllProducts, getProductById, getRelatedProducts, getAllProductsJson, getAllProductCategories, createProduct, upload, deleteProduct, updateProduct, deleteProductPhoto, deleteMainPhoto };
