const passport = require('passport');
const authService = require('../service/authService');

exports.getRegister = (req, res) => {
    res.render('register/register', {
        messages: {
            error: [],
            success: []
        },
        formData: {}
    });
};

exports.postRegister = async (req, res, next) => {
    try {
        const { user_name, email, phone, password, confirm_password } = req.body;

        let errors = [];

        if (!user_name || !email || !password || !confirm_password) {
            errors.push('All fields are required');
        }

        if (password !== confirm_password) {
            errors.push('Passwords do not match');
        }

        if (errors.length > 0) {
            return res.render('register/register', {
                messages: {
                    error: errors,
                    success: []
                },
                formData: { user_name, email, phone }
            });
        }

        const result = await authService.registerUser({
            user_name,
            email,
            phone,
            password
        });

        if (!result.success) {
            return res.render('register/register', {
                messages: {
                    error: [result.message],
                    success: []
                },
                formData: { user_name, email, phone }
            });
        }
        
        res.render('login/login', {
            messages: {
                error: [],
                success: ['Registration successful! Please log in to continue.']
            },
            formData: { email }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.render('register/register', {
            messages: {
                error: ['Password must be at least 6 characters long'],
                success: []
            },
            formData: { 
                user_name: req.body.user_name, 
                email: req.body.email, 
                phone: req.body.phone 
            }
        });
    }
};

exports.getLogin = (req, res) => {
    res.render('login/login', {
        messages: {
            error: [],
            success: []
        },
        formData: {}
    });
};

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.render('login/login', {
            messages: {
                error: ['Please provide both email and password'],
                success: []
            },
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.render('login/login', {
                messages: {
                    error: ['An unexpected error occurred'],
                    success: []
                },
                formData: { email }
            });
        }

        if (!user) {
            return res.render('login/login', {
                messages: {
                    error: [info.message || 'Invalid email or password'],
                    success: []
                },
            });
        }

        // Log in the user
        req.logIn(user, (err) => {
            if (err) {
                return res.render('login/login', {
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

exports.logout = async (req, res, next) => {
    try {
        if (req.session && req.sessionStore) {
            await authService.logoutUser(req.sessionStore, req.sessionID);
        }

        req.logout((err) => {
            if (err) {
                return next(err);
            }
            
            req.session.destroy((err) => {
                if (err) {
                    return next(err);
                }
                res.clearCookie('sessionId');
                res.redirect('/');
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
};