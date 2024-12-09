const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/json',productController.getProductsJSON)
router.get('/:id', productController.getProductDetails);
router.get('/',productController.getShop)
module.exports = router;