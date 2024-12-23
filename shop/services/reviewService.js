const QueryHelper = require('../../utils/QueryHelper');
const AppError = require('../../utils/AppError');
const models = require('../../index');
const Review = models.Review
const Product = models.Product
const getReviewsByProductId = async(productId)=>{
    try{
        const reviews = await Review.findAll(
            {
                where: {
                    product_id: productId
                },
                order: [['created_at','DESC']],
                raw: true
            }
        )
        console.log(reviews)
        return reviews 
    }catch(err)
    {
        console.error(err)
        throw new AppError('Cannot get reviews for product: '+ productId,500)
    }
}

const createReviewForProduct = async(reviewBody)=>{
    try{
        const {product_id,user_id,reviews_msg,rating} = reviewBody
        if(!product_id || !user_id || !reviews_msg || !rating)
        {
            throw new AppError('Invalid data for review',404)
        }
        if(rating < 1 || rating > 5)
        {
            throw new AppError('Rating must be between 1 and 5',404)
        }
        const existingProduct = await Product.findByPk(product_id)
        const existingUser = await User.findByPk(user_id)

        if(!existingProduct ){
            throw new AppError('Product not found: '+ product_id,404)
        }
        if(!existingUser ){
            throw new AppError('User not found: '+ user_id,404)
        }

        const review = await Review.create({
            product_id,
            user_id,
            reviews_msg,
            rating,
        });
        
        return review
    }catch(err)
    {
        console.error(err)
        throw new AppError('Cannot create review for product: '+ productId,500)
    }
}

module.exports = {getReviewsByProductId,createReviewForProduct}