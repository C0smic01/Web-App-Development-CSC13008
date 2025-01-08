exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(403).json({
        success: false,
        error: 'You need to be logged in'
    })
    // res.redirect('/auth/login');
};

exports.isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.status(403).json({
        success: false,
        error: 'You need to log out before continuing'
    })
    // res.redirect('/');
};

exports.authorize = (...roles)=>{
    return (req,res,next)=>{
        const user = res.locals.user

        if(!user){
            res.status(403).json({
                success: false,
                error: 'You do not have permission to access this'
            })
        }

        if (user.Roles && Array.isArray(user.Roles)) {
            const hasRole = user.dataValues.Roles.some(role=>roles.includes(role.dataValues.role_name))

            if (!hasRole) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have the required role to access this'
                });
            }
        } 
        else {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to access this'
            });
        }       
        next()
    }


}