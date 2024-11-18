module.exports = (sequelize,DataTypes)=>{
    
    const OrderDetail = sequelize.define('OrderDetails', {
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
        timestamps: false,
        tableName: 'order_details'
    });
    OrderDetail.associate=  (models)=>{
        OrderDetail.belongsTo(models.Order,{
            foreignKey : {name : 'order_id', allowNull : false}
        })
    }
    return OrderDetail
}