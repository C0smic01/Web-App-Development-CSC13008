const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');

const OrderDetail = sequelize.define('order_details', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, {
    timestamps: false
});
Order.associate=  (models)=>{
    Order.belongsTo(models.orders,{
        foreignKey : {name : 'order_id', allowNull : false}
    })
}
module.exports = OrderDetail;
