const passport = require('passport');
const authService = require('../service/authService');

exports.getRegister = (req, res) => {
    res.render('layouts/layout', { 
        body: '../register/register',
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
};

exports.postRegister = async (req, res, next) => {
    try {
        const { user_name, email, phone, password, confirm_password } = req.body;
        let errors = [];

        // Validate required fields
        if (!user_name || !email || !password || !confirm_password) {
            errors.push('All fields are required');
        }

        // Validate password match
        if (password !== confirm_password) {
            errors.push('Passwords do not match');
        }

        // If there are validation errors, render the page with errors
        if (errors.length > 0) {
            return res.render('layouts/layout', {
                body: '../register/register',
                messages: {
                    error: errors,
                    success: []
                },
                formData: { user_name, email, phone } // Preserve form data
            });
        }

        // Attempt to register user
        const result = await authService.registerUser({
            user_name,
            email,
            phone,
            password
        });

        if (!result.success) {
            return res.render('layouts/layout', {
                body: '../register/register',
                messages: {
                    error: [result.message],
                    success: []
                },
                formData: { user_name, email, phone } // Preserve form data
            });
        }

        // Registration successful
        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/auth/login');

    } catch (error) {
        console.error('Registration error:', error);
        res.render('layouts/layout', {
            body: '../register/register',
            messages: {
                error: ['An unexpected error occurred'],
                success: []
            },
            formData: { user_name, email, phone } // Preserve form data
        });
    }
};

exports.getLogin = (req, res) => {
    res.render('layouts/layout', { 
        body: '../login/login',
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        },
        formData: {} // Initialize empty form data
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
        return res.render('layouts/layout', {
            body: '../login/login',
            messages: {
                error: ['Please provide both email and password'],
                success: []
            },
            formData: { email } // Preserve email only, not password
        });
    }

    // Custom passport authentication handling
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.render('layouts/layout', {
                body: '../login/login',
                messages: {
                    error: ['An unexpected error occurred'],
                    success: []
                },
                formData: { email }
            });
        }

        if (!user) {
            return res.render('layouts/layout', {
                body: '../login/login',
                messages: {
                    error: [info.message || 'Invalid email or password'],
                    success: []
                },
                formData: { email }
            });
        }

        // Log in the user
        req.logIn(user, (err) => {
            if (err) {
                return res.render('layouts/layout', {
                    body: '../login/login',
                    messages: {
                        error: ['Error during login process'],
                        success: []
                    },
                    formData: { email }
                });
            }

            // Successful login
            if (req.session.returnTo) {
                const returnTo = req.session.returnTo;
                delete req.session.returnTo;
                return res.redirect(returnTo);
            }
            return res.redirect('/');
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            req.flash('error', 'Error logging out');
            return res.redirect('/');
        }
        req.flash('success', 'Successfully logged out');
        res.redirect('/auth/login');
    });
};