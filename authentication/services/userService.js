const models = require('../../index');
const User = models.User;
const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const getAllUsers= async(query)=> {
    try {
        const filterConditions = {};

        if (query.search) {
            const searchLower = query.search.toLowerCase(); 
        
            filterConditions[Op.or] = [
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('user_name')),
                    {
                        [Op.like]: `%${searchLower}%`
                    }
                ),
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('email')),
                    {
                        [Op.like]: `%${searchLower}%`
                    }
                )
            ];
        }
        const page = query.page ? parseInt(query.page,9) : 1 
        const limit = query.limit ? parseInt(query.limit,9) : 10 
        const offset = (page-1)* limit

        const validSortFields = ['user_name', 'email', 'created_at'];
        const sortBy = validSortFields.includes(query.sortBy) ? query.sortBy : 'created_at';
        const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';


        const {count, rows: users} = await User.findAndCountAll({
            where: filterConditions, 
            limit: limit,
            offset: offset,
            attributes : ['user_id','user_name','email','created_at','avatar','is_banned'],
            order: [[sortBy,sortOrder]]
        })

        return {
            success: true,
            data: users,
            currentPage: page,
            totalPage: Math.ceil(count / limit)
        }

    } catch (error) {
        console.error(error);
        throw new Error('Error get all accounts');
    }
}


const getUserDetails = async(userId)=>{
    try{
    const user = await User.findByPk(userId,{
        attributes: ['user_id','user_name','phone','email','created_at','avatar','is_banned']
    })
    if(user)
        {
            return {
                success: true,
                data: user
            }
        }else
        {
            return {
                success: false,
                data: null
            }
        }
    }catch(e)
    {
        console.error(e)
        throw new Error('Error while getting user details')
    }
}
const toggleBanUserById = async(userId)=>{
    try{
        const user = await User.findByPk(userId)
        if(user)
        {
            user.is_banned = !user.is_banned
            await user.save()
            const message = user.is_banned ? 'User has been banned' : 'User has been unbanned'
            return {
                success: true,
                message: message
            }
        }else{
            return {
                success: false,
                message: 'User not found'
            }
        }
    }catch(e)
    {
        console.error(e)
        throw new Error('Error while banning user')
    }
}
const updateUser = async (userId, userBody) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        await user.update(userBody);

        return {
            success: true,
            message: 'User updated successfully',
            data: user 
        };

    } catch (e) {
        console.error(e);
        throw new Error('Error while updating user');
    }
};


module.exports ={getAllUsers,getUserDetails,toggleBanUserById,updateUser}