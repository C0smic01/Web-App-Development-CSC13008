const authService = require('../service/authService');

exports.getRegister = (req, res) => {
    res.render('layouts/layout', { 
        body: '../register/register',
        error: null 
    });
};

exports.postRegister = async (req, res) => {
    try {
        const { user_name, email, phone, password, confirm_password } = req.body;
        if (!user_name || !email || !password || !confirm_password) {
            return res.render('layouts/layout', {
                body: '../register/register',
                error: 'All fields are required'
            });
        }

        if (password !== confirm_password) {
            return res.render('layouts/layout', {
                body: '../register/register',
                error: 'Passwords do not match'
            });
        }

        const result = await authService.registerUser({
            user_name,
            email,
            phone,
            password
        });

        if (!result.success) {
            console.log(result.message)

            return res.render('layouts/layout', {
                body: '../register/register',
                error: result.message
            });
        }
        // Redirect to login page after successful registration
        return res.redirect('/auth/login?registered=true');

    } catch (error) {
        return res.render('layouts/layout', {
            body: '../register/register',
            error: 'Registration failed. Please try again.'
        });
    }
};

exports.getLogin = (req, res) => {
    const registered = req.query.registered === 'true';
    res.render('layouts/layout', { 
        body: '../login/login',
        error: null,
        success: registered ? 'Registration successful! Please login.' : null
    });
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('layouts/layout', {
                body: '../login/login',
                error: 'Email and password are required'
            });
        }

        const result = await authService.loginUser(email, password);

        if (!result.success) {
            return res.render('layouts/layout', {
                body: '../login/login',
                error: result.message
            });
        }

        // Set session
        req.session.user = {
            user_id: result.user.user_id,
            user_name: result.user.user_name,
            email: result.user.email
        };

        // Redirect to home page after successful login
        return res.redirect('/');

    } catch (error) {
        console.error('Login error:', error);
        return res.render('layouts/layout', {
            body: '../login/login',
            error: 'Login failed. Please try again.'
        });
    }
};