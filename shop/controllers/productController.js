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

exports.getProductsJSON = async(req, res, next) => {
    try {
        const products = await productService.getAllProductsJson(req.query)
        res.json(products);
    } catch(e) {
        next(e);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
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