const ejs = require('ejs');
const path = require('path');

exports.getShop = (req, res) => {
    res.render('layouts/layout', { body: '../shop/shop' });
};
