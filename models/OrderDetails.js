module.exports = (sequelize,DataTypes)=>{
    
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
    OrderDetail.associate=  (models)=>{
        OrderDetail.belongsTo(models.orders,{
            foreignKey : {name : 'order_id', allowNull : false}
        })
    }
    return OrderDetail
}