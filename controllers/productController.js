const ejs = require('ejs');
const path = require('path');
const productService = require('../service/productService')

exports.getShop = async(req, res,next) => {
    try{
        
        const products = await productService.getAllProducts(req.query)
        res.render('layouts/layout', { body: '../shop/shop',data:products});

    }catch(e)
    {
        next(e);
    }
};


exports.getProductDetails = async(req,res,next)=>{
    try{
        const product = await productService.getProductById(req.params.id)
        const relatedProducts = await productService.getRelatedProducts(req.params.id, {limit: 4})
        res.render('layouts/layout',{body: '../product/product', data:product, relatedProducts:relatedProducts})
    }
    catch(e)
    {
        next(e);
    }

}
