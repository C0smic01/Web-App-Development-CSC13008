const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Product = sequelize.define('products', {
    product_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0, 
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true, 
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Product