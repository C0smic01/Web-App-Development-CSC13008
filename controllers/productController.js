const ejs = require('ejs');
const path = require('path');
const productService = require('../service/productService')
exports.getShop = async(req, res,next) => {
    const products = await productService.getAllProducts(req.query)
    res.render('layouts/layout', { body: '../shop/shop',data:products});
};
exports.getProductDetails = async(req,res,next)=>{
    const product = await productService.getProductById(req.params.id)
    res.render('layouts/layout',{body: '../product/product',data:product})
}
