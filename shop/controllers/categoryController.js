const categoryService = require('../services/categoryService');

class categoryController {
    async getCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createCategory(req, res) {
        try {
            const { category_name } = req.body;
            if (!category_name) {
                return res.status(400).json({ error: 'Category name is required' });
            }
            
            const newCategory = await categoryService.createCategory(category_name);
            res.status(201).json(newCategory);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ error: 'Category already exists' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { category_name } = req.body;
            
            if (!category_name) {
                return res.status(400).json({ error: 'Category name is required' });
            }

            const updatedCategory = await categoryService.updateCategory(categoryId, category_name);
            if (!updatedCategory) {
                return res.status(404).json({ error: 'Category not found' });
            }
            
            res.json(updatedCategory);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ error: 'Category name already exists' });
            }
            res.status(500).json({ error: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const deleted = await categoryService.deleteCategory(categoryId);
            
            if (!deleted) {
                return res.status(404).json({ error: 'Category not found' });
            }
            
            res.status(200).json({ 
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = new categoryController();