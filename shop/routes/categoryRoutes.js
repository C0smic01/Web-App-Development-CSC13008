const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController.js');

router.get('/api', categoryController.getCategories);
router.post('/api', categoryController.createCategory);
router.put('/api/:categoryId', categoryController.updateCategory);
router.delete('/api/:categoryId', categoryController.deleteCategory);

module.exports = router;