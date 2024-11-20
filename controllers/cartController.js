const ejs = require('ejs');
const path = require('path');

exports.getCart = (req, res) => {
    res.render('cart/cart' );
};
