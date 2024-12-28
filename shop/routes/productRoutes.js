const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productService = require('../services/productService');

// Use multer middleware for file upload route
router.post('/', productService.upload.array('images', 5), productController.createProduct);
router.get('/json', productController.getProductsJSON);
router.get('/product-categories/api', productController.getProductCategories);
router.get('/:id', productController.getProductDetails);
router.get('/', productController.getShop);

module.exports = router;
