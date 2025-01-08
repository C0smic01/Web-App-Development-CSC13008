const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const productService = require('../services/productService');

router.get('/json', productController.getProductsJSON);
router.get('/json/:id', productController.getProductJSON);
router.post('/json', productService.upload.array('images', 5), productController.createProduct);
router.put('/json/:id', productService.upload.array('photos', 5), productController.updateProduct);
router.delete('/json/:id', productController.deleteProduct);
router.delete('/json/:id/photo/main', productController.deleteMainPhoto);
router.delete('/json/:id/photos/:photoId', productController.deleteProductPhoto);
router.get('/product-categories/api', productController.getProductCategories);
router.get('/:id', productController.getProductDetails);
router.get('/', productController.getShop);

module.exports = router;
