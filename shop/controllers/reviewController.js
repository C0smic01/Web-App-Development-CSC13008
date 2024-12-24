const ejs = require('ejs');
const path = require('path');
const productService = require('../services/productService')
const reviewService = require('../services/reviewService')

exports.createReview = async(req,res,next)=>{
    try{
        const user = res.locals.user?.dataValues || res.locals.user
        const {product_id, reviews_msg,rating} =req.body
        if (!product_id || !reviews_msg || rating == null) {
            return res.status(404).json({
                success: false,
                message: 'Invalid input: Missing required fields (product_id, reviews_msg, rating)',
            });
        }
        
        const reviewBody = {
            product_id,
            user_id: user.user_id,
            reviews_msg,
            rating,
        };

        const review = await reviewService.createReviewForProduct(reviewBody)

        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: {review}
        })
    }catch(e){
        next(e)
    }
}


exports.getReviewsHtmlByProduct = async(req,res,next)=>{
    try{
        const product_id = req.params.product_id
        if (!product_id ) {
            return res.status(404).json({
                success: false,
                message: 'Invalid input: Missing required fields (product_id, reviews_msg, rating)',
            });
        }
        const reviews = await reviewService.getReviewsByProductId(product_id,req.query.review)
        const reviewHtml = await new Promise((resolve, reject) => {
            res.app.render('review/reviewList', {reviews:reviews.reviews, currentPage: reviews.currentPage, totalPage: reviews.totalPage,product: product_id }, (err, html) => {
                    if (err) return reject(err);
                        resolve(html);
                });
            });
        
        
        res.status(200).json({ 
            reviewHtml
        });
            
    }
    catch(e){
        next(e)
    }
}
