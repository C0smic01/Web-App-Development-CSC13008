const QueryHelper = require('../../utils/QueryHelper');
const AppError = require('../../utils/AppError');
const models = require('../../index');
const Review = models.Review
const Product = models.Product
const User = models.User
const sequelize = require('sequelize')

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime); 

const getReviewsByProductId = async (productId, query) => {
    try {
        if (!productId) throw new AppError('Product ID is required', 404);

        const summary = await Review.findOne({
            where: { product_id: productId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
                [sequelize.fn('COUNT', sequelize.col('user_id')), 'total_review']
            ],
            raw: true,
        });

        const page = query?.page ? parseInt(query.page, 10) : 1; 
        const limit = query?.limit ? Math.min(parseInt(query.limit, 10), 9) : 3; 
        const offset = (page - 1) * limit;

        const { count, rows: reviews } = await Review.findAndCountAll({
            limit,
            offset,
            where: { product_id: productId },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_name', 'phone'],
                },
            ],
            attributes: ['rating', 'createdAt', 'reviews_msg'],
        });

        const plainReviews = reviews.map((review) => {
            const plainReview = review.get({ plain: true });
            plainReview.createdAt = dayjs(plainReview.createdAt).fromNow();
            return plainReview;
        });

        return {
            currentPage: page,
            totalPage: Math.ceil(count / limit),
            avg_rating: summary?.avg_rating
                ? parseFloat(summary.avg_rating).toFixed(1)
                : '0.0',
            total_review: summary?.total_review
                ? parseInt(summary.total_review, 10)
                : 0,
            reviews: plainReviews,
        };
    } catch (err) {
        console.error(err);
        throw new AppError('Cannot get reviews for product: ' + productId, 500);
    }
};

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
        throw new AppError('Cannot create review for product: '+ product_id,500)
    }
}

module.exports = {getReviewsByProductId,createReviewForProduct}