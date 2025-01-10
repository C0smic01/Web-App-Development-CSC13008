const passport = require('passport');
const authService = require('../services/authService');
const EmailSender = require('../../utils/EmailSender');
const { validateUsername, validateEmail, validatePassword } = require('../../utils/ValidationRules');
const models = require('../../index');
const Role = models.Role;
const UserRole = models.UserRole;

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
            const host = req.get('host');

            let errors = [];

            const usernameValidation = validateUsername(user_name);
            const emailValidation = validateEmail(email);
            const passwordValidation = validatePassword(password, confirm_password);

            if (!usernameValidation.isValid) errors.push(usernameValidation.message);
            if (!emailValidation.isValid) errors.push(emailValidation.message);
            if (!passwordValidation.isValid) errors.push(passwordValidation.message);

            if (errors.length > 0) {
                return res.render('register/register', {
                    messages: {
                        error: errors,
                        success: []
                    },
                    formData: { user_name, email, phone }
                });
            }

            const isUsernameAvailable = await authService.checkAvailability('user_name', user_name);
            const isEmailAvailable = await authService.checkAvailability('email', email);

            if (!isUsernameAvailable) {
                errors.push('Username not available');
            }
            if (!isEmailAvailable) {
                errors.push('Email already registered');
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
                password,
                host
            });

            const role = await Role.findOne({ where: { role_name: 'USER' } });
            if (role) {
            await UserRole.create({
                user_id: result.user_id,
                role_id: role.role_id,
            });
            } 

            if (!result.success) {
                return res.render('register/register', {
                    messages: {
                        error: [result.message],
                        success: []
                    },
                    formData: { user_name, email, phone }
                });
            }
            
            res.render('register/register', {
                messages: {
                    error: [],
                    success: ['Registration successful! Please check your email to verify your account.']
                },
                formData: { user_name, email, phone }
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


    getAvailability = async (req, res) => {
        const {field, value} = req.query;

        if (field != 'email' && field != 'user_name') {
            return res.status(400).json({ message: 'Invalid field' });
        }
        else if (!value) {
            return res.status(400).json({ message: 'Invalid value' });
        }

        try {
            const isAvailable = await authService.checkAvailability(field, value);
            res.json({ available: isAvailable });
        }
        catch (error) {
            console.error('Availability check error:', error);
            return res.status(500).json({ message: 'An unexpected error occurred' });
        }
    };

    getVerifyEmail = async (req, res) => {
        const { token } = req.query;

        if (!token) {
            return res.render('login/login', {
                messages: {
                    error: ['Invalid or missing verification token'],
                },
            });
        }

        try {
            const result = await authService.verifyEmail(token);

            if (!result.success) {
                return res.render('login/login', {
                    messages: {
                        error: [result.message],
                    },
                });
            }

            return res.render('login/login', {
                messages: {
                    error: [],
                    success: ['Email verified successfully! You can now log in.']
                },
            });

        } catch (error) {
            console.error('Email verification error:', error);
            return res.render('login/login', {
                messages: {
                    error: ['An unexpected error occurred during email verification'],
                },
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
                return res.render('login/login', {
                    messages: {
                        error: [info.message || 'Invalid email or password'],
                    },
                });
            }

            if (!user.is_verified) {
                EmailSender.sendEmail(user, req.get('host'), 'emailVerification');
                return res.render('login/login', {
                    messages: {
                        error: ['Please check your email to verify your account before logging in.'],
                    },
                    formData: { email }
                });
            }

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


    postLoginJson = (req, res, next) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: 'Please provide both email and password'
            })
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error('Error during login: ', err); 
                return res.status(501).json({
                    success: false,
                    message: 'An unexpected error occurred'
                })
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid email or password'
                })
            }

            if (!user.is_verified) {
                EmailSender.sendEmail(user, req.get('host'), 'emailVerification');
                return res.status(403).json({
                    success: false,
                    message: 'Please check your email to verify your account before logging in.'
                })
            }

            req.logIn(user, (err) => {
                if (err) {
                    
                    console.error('Error during session login: ', err)
                    return res.status(501).json({
                        success: false,

                        message: 'Error during login process'
                    })
                }

                return res.status(200).json({
                    success: true,
                    data: user,
                    message: 'Login successful'
                });

                // Successful login
                // if (req.session.returnTo) {
                //     const returnTo = req.session.returnTo;
                //     delete req.session.returnTo;
                //     return res.redirect(returnTo);
                // }
                // return res.redirect('/');
            });
        })(req, res, next);
    };

    getGoogleAuth = (req, res, next) => {
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res, next);
    };
    
    handleGoogleCallback = (req, res, next) => {
        passport.authenticate('google', {
            failureRedirect: '/auth/login',
            failureFlash: true,
            session: true 
        }, async (err, user, info) => {
            if (err) { 
                return next(err); 
            }
            if (!user) { 
                return res.redirect('/auth/login'); 
            }
    
            try {
                if (user && !user.is_verified) {
                    await authService.verifyUserByGoogleAuth(user);
                }

                req.logIn(user, (err) => {
                    if (err) { 
                        return next(err); 
                    }
                    
                    req.session.save((err) => {
                        if (err) {
                            console.error('Session save error:', err);
                            return next(err);
                        }
                        
                        if (req.session.returnTo) {
                            const returnTo = req.session.returnTo;
                            delete req.session.returnTo;
                            return res.redirect(returnTo);
                        }
                        
                        return res.redirect('/');
                    });
                });
            } catch (error) {
                console.error('Google authentication error:', error);
                return res.redirect('/auth/login');
            }
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
    logoutJson = async (req, res, next) => {
        try {
            if (req.session && req.sessionStore) {
                await authService.logoutUser(req.sessionStore, req.sessionID);
            }
    
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        error: err 
                    });
                }
    
                req.session.destroy((err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            error: err 
                        });
                    }
                    
                    res.clearCookie('sessionId');
                    return res.status(200).json({
                        success: true,
                        message: "Logout successfully"
                    });
                });
            });
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                error: error.message 
            });
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
    
        const passwordValidation = validatePassword(password, confirm_password);
        if (!passwordValidation.isValid) {
            errors.push(passwordValidation.message);
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