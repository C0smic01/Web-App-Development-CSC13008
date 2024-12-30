const models = require('../../index');
const User = models.User;
const getAllUser = async(query)=>{
    try{
        const page = query.page ? parseInt(query.page,9) : 1 
        const limit = query.limit ? parseInt(query.limit,9) : 10 
        const offset = (page-1)* limit
        const {count, rows: users} = await User.findAndCountAll({
            limit: limit,
            offset: offset,
            attributes : ['user_name','email','created_at','avatar']
        })
        return {
            success: true,
            data: users,
            currentPage: page,
            totalPage: Math.ceil(count / limit)
        }
        
    }catch(err)
    {
        console.error(err)
        return {
          success: false,
          err   
        }
    }


}

module.exports ={getAllUser}