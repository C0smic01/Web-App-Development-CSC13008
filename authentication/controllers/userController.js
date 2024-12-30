const userService = require('../services/userService')

const getAllUsers = async(req,res,next)=>{
    const users = await userService.getAllUser(req.query)
    if(users.success)
    {
        res.status(200).json(users)
    }else{
        res.status(500).json('Error while getting users')
    }
}

module.exports = {getAllUsers}