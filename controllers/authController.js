const ejs = require('ejs');
const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.login = (req, res) => {
    res.render('layouts/layout', { body: '../auth/login' });
};

exports.getRegister = (req, res) => {
    res.render('layouts/layout', { body: '../auth/register' });
};

exports.postRegister = async (req, res) => {
    try {
        const { user_name, email, phone, password, confirm_password } = req.body;

        if (password !== confirm_password) {
            return res.status(400).render('layouts/layout', {
                body: '../auth/register',
                error: 'Passwords do not match'
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).render('layouts/layout', {
                body: '../auth/register',
                error: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            user_name,
            email,
            phone,
            password: hashedPassword
        });

        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).render('layouts/layout', {
            body: '../auth/register',
            error: 'Registration failed. Please try again.'
        });
    }
};
