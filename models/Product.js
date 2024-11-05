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
Product.associate = (models)=>{
    Product.belongsToMany(models.users,{
        foreignKey: {name :'product_id'},
        through : 'reviews'
    }),
    Product.belongsTo(models.status,{
        foreignKey: {name :'status_id'}
    }),
    Product.belongsTo(models.manufacturers,{
        foreignKey : {name : 'manufacturer_id'},
    })

}
module.exports = Product