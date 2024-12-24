const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const AuthMiddleware = require('../../middleware/auth')
router.post('/',AuthMiddleware.isAuthenticated, reviewController.createReview);
router.get('/partial/:product_id', reviewController.getReviewsHtmlByProduct);

module.exports = router;