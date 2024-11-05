const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Status = sequelize.define('status', {
    status_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    status_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status_type: {
        type: DataTypes.ENUM("PRODUCT","ORDER"),
        allowNull: false,
    }
}, {
    timestamps: false
});
Status.associate=  (models)=>{
    Status.hasMany(models.products,{
        foreignKey : {name :'status_id', allowNull : false}
    })
    Status.belongsToMany(models.orders,{
        foreignKey: {name : 'order_id', allowNull: false},
        through : 'order_status'
    })
}

module.exports = Status