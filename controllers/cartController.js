const ejs = require('ejs');
const path = require('path');

exports.getCart = (req, res) => {
    res.render('layouts/layout', { body: '../cart/cart' });
};
