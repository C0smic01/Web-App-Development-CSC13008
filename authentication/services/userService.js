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
        const {count, rows: users} = await User.findAndCountAll({
            where: filterConditions, 
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

    } catch (error) {
        console.error(error);
        throw new Error('Error get all accounts');
    }
}

module.exports ={getAllUsers}