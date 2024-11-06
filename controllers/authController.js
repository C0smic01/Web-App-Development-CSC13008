const ejs = require('ejs');
const path = require('path');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.login = (req, res) => {
    res.render('layouts/layout', { body: '../login/login' });
};

exports.getRegister = (req, res) => {
    res.render('layouts/layout', { body: '../register/register' });
};

exports.postRegister = async (req, res) => {
    try {
        const { user_name, email, phone, password, confirm_password } = req.body;

        // Check for missing fields
        if (!user_name || !email || !password || !confirm_password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Check password match
        if (password !== confirm_password) {
            return res.status(400).json({
                message: 'Passwords do not match'
            });
        }

        // Check email exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({  // 409 Conflict
                message: 'Email already registered'
            });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({
            user_name,
            email,
            phone,
            password: hashedPassword
        });

        // Return success
        return res.status(201).json({  // 201 Created
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'Registration failed. Please try again.'
        });
    }
};