const Sequelize = require('sequelize');
const { Op } = require('sequelize'); 
const sequelize = require('../../config/database');
const QueryHelper = require('../../utils/QueryHelper');
const AppError = require('../../utils/AppError');
const models = require('../../index');
const Category = models.Category;

class CategoryService {
    async getAllCategories(query) {
        try{
        
            const queryBuilder = new QueryHelper(Category,query)
            const categories = await Category.findAll();
            return categories.map(c=>c.dataValues)
        }catch(e)
        {
            throw new AppError("Error while getting categories",404)
        }  
    }

    async createCategory(categoryName) {
        return await Category.create({
            category_name: categoryName
        });
    }

    async updateCategory(categoryId, categoryName) {
        const [updatedRowsCount, updatedCategories] = await Category.update(
            { category_name: categoryName },
            {
                where: { category_id: categoryId },
                returning: true
            }
        );
        
        return updatedRowsCount > 0 ? updatedCategories[0] : null;
    }

    async deleteCategory(categoryId) {
        const deletedRowsCount = await Category.destroy({
            where: { category_id: categoryId }
        });
        
        return deletedRowsCount > 0;
    }
}


module.exports = new CategoryService();
