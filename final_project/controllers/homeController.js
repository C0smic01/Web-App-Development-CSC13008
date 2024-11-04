const ejs = require('ejs');
const path = require('path');

exports.getHome = (req, res) => {
    res.render('layouts/layout', { body: '../home/home' });
};
