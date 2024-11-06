exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ message: 'Authentication required' });
};

// Middleware to check if user is NOT authenticated (for login/register pages)
exports.isNotAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }
    res.redirect('/'); // Redirect to home if already logged in
};