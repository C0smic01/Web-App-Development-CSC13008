const ejs = require('ejs');
const path = require('path');
const productService = require('../service/productService')
const categoryService = require('../service/categoryService')
const manufacturerService = require('../service/manufacturerService')
const statusService = require('../service/statusService')

exports.getShop = async(req, res,next) => {
    try{
        
        const products = await productService.getAllProducts(req.query)
        const categories = await categoryService.getAllCategories(req.query)
        const manufacturers = await manufacturerService.getAllManufacturers(req.query)
        const productStatus = await statusService.getProductStatus(req.query)
        res.render('shop/shop',{products,categories,manufacturers,productStatus});

    }catch(e)
    {
        next(e);
    }
};
exports.getProducts = async(req, res,next) => {
    try{
        
        const products = await productService.getAllProducts(req.query)
        const productHtml = await new Promise((resolve, reject) => {
            res.app.render('product/productList', { products }, (err, html) => {
                if (err) {
                    return reject(err); 
                }
                resolve(html); 
            });
        });
        res.json({ productHtml }); 
    }catch(e)
    {
        next(e);
    }
};

exports.getProductDetails = async(req,res,next)=>{
    try{
        const product = await productService.getProductById(req.params.id)
        const relatedProducts = await productService.getRelatedProducts(req.params.id, {limit: 4})
        res.render('product/productDetails', {product, relatedProducts})
    }
    catch(e)
    {
        next(e);
    }

}
