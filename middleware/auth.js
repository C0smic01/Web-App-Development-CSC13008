exports.isAuthenticated = (req, res, next) => {
    console.log('isAuthenticated middleware is called')
    if (req.isAuthenticated()) {
        console.log('Passing authentication')
        return next();
    }
    console.log('Unauthenticated')

    res.status(403).json({
        success: false,
        error: 'You need to be logged in'
    })
    // res.redirect('/auth/login');
};

exports.isNotAuthenticated = (req, res, next) => {
    console.log('isNotAuthenticated middleware is called')
    if (!req.isAuthenticated()) {
        console.log('Passing not authentication')
        return next();
    }
    console.log('Authenticated')

    res.status(403).json({
        success: false,
        error: 'You need to log out before continuing'
    })
    // res.redirect('/');
};

exports.authorize = (...roles)=>{

    return (req,res,next)=>{
        console.log('Authorization middleware is called')
        const user = res.locals.user

        if(!user){
            console.log('Unauthorizated')

            res.status(403).json({
                success: false,
                error: 'You do not have permission to access this'
            })
        }

        if (user.Roles && Array.isArray(user.Roles)) {
            const hasRole = user.dataValues.Roles.some(role=>roles.includes(role.dataValues.role_name))

            if (!hasRole) {
                console.log('Unauthorizated')

                return res.status(403).json({
                    success: false,
                    error: 'You do not have the required role to access this'
                });
            }
        } 
        else {
            console.log('Unauthorizated')

            return res.status(403).json({
                success: false,
                error: 'You do not have permission to access this'
            });
        }       

        console.log('Passing authorization')
        
        next()
    }


}