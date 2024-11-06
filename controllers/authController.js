const ejs = require('ejs');
const path = require('path');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.getRegister = (req, res) => {
    res.render('layouts/layout', { body: '../register/register' });
};

exports.postRegister = async (req, res) => {
    try {
        const { user_name, email, phone, password, confirm_password } = req.body;

        if (!user_name || !email || !password || !confirm_password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        if (password !== confirm_password) {
            return res.status(400).json({
                message: 'Passwords do not match'
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({  
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
            user_name,
            email,
            phone,
            password: hashedPassword
        });

        return res.status(201).json({  
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'Registration failed. Please try again.'
        });
    }
};

exports.login = (req, res) => {
    res.render('layouts/layout', { body: '../login/login' });
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ 
            where: { email },
            attributes: ['user_id', 'user_name', 'email', 'password'] 
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        req.session.user = {
            user_id: user.user_id,
            user_name: user.user_name,
            email: user.email
        };

        return res.status(200).json({
            message: 'Login successful',
            user: {
                user_name: user.user_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: 'Login failed. Please try again.'
        });
    }
};