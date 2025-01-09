const ejs = require('ejs');
const path = require('path');
const productService = require('../services/productService')
const categoryService = require('../services/categoryService')
const manufacturerService = require('../services/manufacturerService')
const statusService = require('../services/statusService')
const reviewService = require('../services/reviewService')

exports.getShop = async(req, res, next) => {
    try {
        const {products, currentPage, totalPage} = await productService.getAllProducts(req.query)
        const categories = await categoryService.getAllCategories(req.query)
        const manufacturers = await manufacturerService.getAllManufacturers(req.query)
        const productStatus = await statusService.getProductStatus(req.query)

        res.render('shop/shop', {
            products,
            categories,
            manufacturers,
            productStatus,
            currentPage,
            totalPage
        });
    } catch(e) {
        next(e);
    }
};

exports.getProducts = async(req, res, next) => {
    try {
        const {products, currentPage, totalPage} = await productService.getAllProducts(req.query);
        
        const productHtml = await new Promise((resolve, reject) => {
            res.app.render('product/productList', { products }, (err, html) => {
                if (err) return reject(err);
                resolve(html);
            });
        });

        const paginationHtml = await new Promise((resolve, reject) => {
            res.app.render('shop/pagination', { 
                currentPage, 
                totalPage 
            }, (err, html) => {
                if (err) return reject(err);
                resolve(html);
            });
        });

        res.json({ 
            productHtml, 
            paginationHtml,
            currentPage, 
            totalPage 
        });
    } catch(e) {
        next(e);
    }
};

exports.getProductDetails = async(req,res,next)=>{
    try{
        const product = await productService.getProductById(req.params.id)
        const reviews = await reviewService.getReviewsByProductId(product.product_id,req.query.review)
        const relatedProducts = await productService.getRelatedProducts(req.params.id, {limit: 3})
        res.render('product/productDetails', {product, relatedProducts,reviews})
    }
    catch(e)
    {
        next(e);
    }

}

// Get all products
exports.getProductsJSON = async(req, res, next) => {
    try {
        const result = await productService.getAllProductsJson(req.query);
        res.json({
            success: true,
            data: result.products,
            pagination: {
                total: result.total,
                currentPage: result.currentPage,
                totalPages: result.totalPages
            }
        });
    } catch(e) {
        next(e);
    }
};

// Get 1 product 
exports.getProductJSON = async(req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch(e) {
        next(e);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        console.log(req.body.name)
        
        const result = await productService.createProduct(req.body, req.files);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.getProductCategories = async(req, res, next) => {
    try {
        const productCategories = await productService.getAllProductCategories()
        res.json(productCategories);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteProduct = async (req, res, next) => {
    try {
        const result = await productService.deleteProduct(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const result = await productService.updateProduct(req.params.id, req.body, req.files);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteProductPhoto = async (req, res, next) => {
    try {
        const result = await productService.deleteProductPhoto(req.params.id, req.params.photoId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.deleteMainPhoto = async (req, res, next) => {
    try {
        const result = await productService.deleteMainPhoto(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};