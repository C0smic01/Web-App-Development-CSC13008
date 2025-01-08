const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

module.exports = (sequelize,DataTypes)=>{
    
    const Review = sequelize.define('Review', {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'products',
                key: 'product_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        reviews_msg: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 0,
                max: 5
            }
        }
    }, {
        timestamps: true,
        tableName: 'reviews'
    });
    Review.associate = (models) => {
        Review.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'product', 
        });
    
        Review.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user', 
        });
    };
    return Review
}