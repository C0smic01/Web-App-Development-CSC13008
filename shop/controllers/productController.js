const ejs = require('ejs');
const path = require('path');
const productService = require('../services/productService')
const categoryService = require('../services/categoryService')
const manufacturerService = require('../services/manufacturerService')
const statusService = require('../services/statusService')

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
        const relatedProducts = await productService.getRelatedProducts(req.params.id, {limit: 3})
        res.render('product/productDetails', {product, relatedProducts})
    }
    catch(e)
    {
        next(e);
    }

}

exports.getProductsJSON = async(req, res, next) => {
    try {
        const products = await productService.getAllProductsJson(req.query)
        res.json(
            products.map(product => ({
                product_id: product.product_id,
                product_name: product.product_name,
                price: product.price,
                img: product.img,
                remaining: product.remaining,
                description: product.description,
                status_id: product.status_id,
                manufacturer_id: product.manufacturer_id,
                categories: product.categories.map(cat => cat.category_name),
            }))
        );
    } catch(e) {
        next(e);
    }
};