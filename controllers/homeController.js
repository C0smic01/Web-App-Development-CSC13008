const productService = require('../service/productService')

exports.getHome = async(req, res,next) => {
    const products = await productService.getAllProducts(query = {limit : 8})
    res.render('home/home',{products} );
};
