const passport = require('passport');
const authService = require('../services/authService');

class authController {
    getRegister = (req, res) => {
        res.render('register/register', {
            messages: {
                error: [],
                success: []
            },
            formData: {}
        });
    };

    postRegister = async(req, res, next) => {
        try {
            const { user_name, email, phone, password, confirm_password } = req.body;

            let errors = [];

            if (!user_name || !email || !password || !confirm_password) {
                errors.push('All fields are required');
            }

            if (password !== confirm_password) {
                errors.push('Passwords do not match');
            }

            if (password.length < 6) {
                errors.push('Password must be at least 6 characters long');
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
                    error: ['An unexpected error occurred'],
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

    getLogin = (req, res) => {
        res.render('login/login', {
            messages: {
                error: [],
                success: []
            },
            formData: {}
        });
    };

    postLogin = (req, res, next) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.render('login/login', {
                messages: {
                    error: ['Please provide both email and password'],
                },
            });
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error('Error during login: ', err); 
                return res.render('login/login', {
                    messages: {
                        error: ['An unexpected error occurred'],
                    },
                    formData: { email }
                });
            }

            if (!user) {
                console.log('Login failed: ', info.message); 
                return res.render('login/login', {
                    messages: {
                        error: [info.message || 'Invalid email or password'],
                    },
                });
            }

            // Log in the user
            req.logIn(user, (err) => {
                if (err) {
                    console.error('Error during session login: ', err)
                    return res.render('login/login', {
                        messages: {
                            error: ['Error during login process'],
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


    getAuthStatus = (req,res,next) => {
        if (req.isAuthenticated()) {
            return res.json({
                isAuthenticated: true,
                user: {
                    username: req.user.username,
                    avatar: req.user.avatar || '/img/default-avatar.png',
                },
            });
        }
        return res.json({ isAuthenticated: false });
    }

    logout = async (req, res, next) => {
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

    getForgotPassword = (req, res) => {
        res.render('login/forgotPassword', {
            messages: {
                error: [],
                success: []
            },
            formData: {}
        });
    };

    postForgotPassword = async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.render('login/forgotPassword', {
                messages: {
                    error: ['Please provide an email address'],
                    success: []
                },
                formData: { email }
            });
        }

        try {
            const result = await authService.forgotPassword(req.get('host'), email);

            if (!result.success) {
                return res.render('login/forgotPassword', {
                    messages: {
                        error: [result.message],
                        success: []
                    },
                    formData: { email }
                });
            }

            return res.render('login/forgotPassword', {
                messages: {
                    error: [],
                    success: ['Password reset link sent to email']
                },
                formData: { email }
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            return res.render('login/forgotPassword', {
                messages: {
                    error: ['An unexpected error occurred'],
                    success: []
                },
                formData: { email }
            });
        }
    };

    getResetPassword = async (req, res) => {
        const { token } = req.query;

        if (!token) {
            return res.render('login/forgotPassword', {
                messages: {
                    error: ['Invalid or missing reset token'],
                    success: []
                }
            });
        }

        try {
            const result = await authService.validateResetToken(token);

            if (!result.success) {
                return res.render('login/forgotPassword', {
                    messages: {
                        error: [result.message],
                        success: []
                    }
                });
            }

            res.render('login/resetPassword', {
                messages: {
                    error: [],
                    success: []
                },
                token: token
            });

        } catch (error) {
            console.error('Reset password token validation error:', error);
            return res.render('login/forgotPassword', {
                messages: {
                    error: ['An unexpected error occurred'],
                    success: []
                }
            });
        }
    }

    postResetPassword = async (req, res) => {
        const { token, password, confirm_password } = req.body;

        let errors = [];

        if (!token) {
            errors.push('Invalid reset token');
        }

        if (!password || !confirm_password) {
            errors.push('All fields are required');
        }

        if (password !== confirm_password) {
            errors.push('Passwords do not match');
        }
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        if (errors.length > 0) {
            return res.render('login/resetPassword', {
                messages: {
                    error: errors,
                    success: []
                },
                token: token
            });
        }

        try {
            const result = await authService.resetPassword(token, password);

            if (!result.success) {
                return res.render('login/resetPassword', {
                    messages: {
                        error: [result.message],
                        success: []
                    },
                    token: token
                });
            }

            return res.render('login/login', {
                messages: {
                    error: [],
                    success: ['Password reset successful. Please log in.']
                }
            });

        } catch (error) {
            return res.render('login/resetPassword', {
                messages: {
                    error: ['An unexpected error occurred'],
                    success: []
                },
                token: token
            });
        }
    };
}

module.exports = new authController();