const ejs = require('ejs');
const path = require('path');

exports.login = (req, res) => {
    res.render('layouts/layout', { body: '../login/login' });
};
exports.register = (req, res) => {
    res.render('layouts/layout', { body: '../register/register' });
};
