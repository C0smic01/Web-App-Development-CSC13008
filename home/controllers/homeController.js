const productService = require('../../shop/services/productService')

exports.getHome = async(req, res,next) => {
    const products = await productService.getAllProducts(query = {limit : 6})
    res.render('home/home',{products} );
};
